import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserEntity } from 'src/user/entities/user.entity';
import { ConversationEntity } from './entities/gemini.entity';
import { Model } from 'mongoose';
import { SMARTBREEDER_SYSTEM_PROMPT } from 'src/constant/system-message.constat';
import { GoogleGenerativeAI, Part } from '@google/generative-ai';
import { GeneratePlaging } from './dto/create-gemini.dto';
import { PlaningService } from 'src/planing/planing.service';
@Injectable()
export class GeminiService {
  private genAI: GoogleGenerativeAI;
  constructor(
    @InjectModel(UserEntity.name) private userModel: Model<UserEntity>,
    @InjectModel(ConversationEntity.name)
    private conversationModel: Model<ConversationEntity>,
    private planing: PlaningService,
  ) {
    this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  }

  private async buildContextualPrompt(
    userId: string,
    animalType: string,
  ): Promise<string> {
    const user = await this.userModel.findById(userId).lean();
    if (!user) return SMARTBREEDER_SYSTEM_PROMPT;

    let prompt = SMARTBREEDER_SYSTEM_PROMPT + "\n\nContexte de l'éleveur:\n";

    // if (user.farmName) prompt += `- Nom de l'exploitation: ${user.farmName}\n`;
    // if (user.farmSize) prompt += `- Taille de l'exploitation: ${user.farmSize}\n`;
    // if (user.location) prompt += `- Localisation: ${user.location}\n`;

    // if (user.livestockDetails) {
    //   prompt += "- Cheptel:\n";
    //   for (const [key, value] of Object.entries(user.livestockDetails)) {
    //     if (value) prompt += `  - ${key}: ${value} têtes\n`;
    //   }
    // }

    //     prompt += `\nPriorités pour les réponses:
    // 1. Adapter les conseils à la taille de l'exploitation (${user.farmSize})
    // 2. Tenir compte de la localisation (${user.location || 'non précisée'})
    // 3. Proposer des solutions adaptées au cheptel`;

    //     if (user.hasConnectedDevices) {
    //       prompt += '\n4. Intégrer les données des capteurs IoT si disponibles';
    //     }

    return prompt;
  }

  private textToPart(text: string): Part[] {
    return [{ text }];
  }

  async startVeterinaryChat(userId: string, animalType: string) {
    // Trouver le prompt système adapté
    const systemPrompt = SMARTBREEDER_SYSTEM_PROMPT;

    const promptContent = await this.buildContextualPrompt(userId, 'volailles');

    // Initialiser l'IA Google
    const model = this.genAI.getGenerativeModel({
      model: 'gemini-2.0-flash:generateContent',
    });

    // Créer la conversation dans MongoDB
    const newConversation = new this.conversationModel({
      user: userId,
      animalType,
      systemPrompt: systemPrompt,
      messages: [
        {
          content: promptContent,
          role: 'system',
        },
      ],
      status: 'actif',
    });

    await newConversation.save();

    // Initialiser le chat avec l'historique
    const chat = model.startChat({
      history: [
        { role: 'user', parts: this.textToPart(promptContent) },
        {
          role: 'model',
          parts: this.textToPart('Prêt à aider! Parlez-moi de votre élevage.'),
        },
      ],
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7,
      },
    });

    return {
      conversationId: newConversation._id,
      chatInstance: chat,
    };
  }

  async sendMessage(conversationId: string, message: string) {
    const conversation = await this.conversationModel.findById(conversationId);
    if (!conversation) throw new Error('Conversation not found');

    // Add user message to conversation
    conversation.messages.push({
      content: message,
      role: 'user',
    });
    await conversation.save();

    // Get the chat model
    const model = this.genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
    });
    const chat = model.startChat({
      history: conversation.messages.map((msg) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: this.textToPart(msg.content),
      })),
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7,
      },
    });

    // Send message with proper parts format
    const result = await chat.sendMessage(this.textToPart(message));
    const response = await result.response;
    const text = response.text();

    // Add assistant response to conversation
    conversation.messages.push({
      content: text,
      role: 'assistant',
    });
    await conversation.save();

    return text;
  }

  async generateStrictPlanningPrompt(params) {
    // Configuration des références par type d'animal
    const REFERENCE_CONFIG = {
      bovins: {
        url: 'https://agritrop.cirad.fr/605485/1/605485.pdf',
        keyPages: {
          protocols: [12, 15],
          intervals: [18, 20],
          exceptions: 22,
        },
      },
      // ... autres types d'animaux
    };

    // Structure JSON stricte avec commentaires
    const JSON_TEMPLATE = `{
  "nom": {
    "type": "string",
    "required": true,
    "description": "Nom de l’élevage"
  },
  "type": {
    "type": "string",
    "required": true,
    "enum": ["bovins", "ovins", "caprins", "porcins", "volailles"],
    "description": "Type d’élevage"
  },
  "user_id": {
    "type": "string",
    "required": true,
    "description": "Identifiant MongoDB de l'utilisateur"
  },
  "conditions_initiales": {
    "type": "object",
    "required": true,
    "description": "Conditions au moment de l’arrivée des animaux",
    "properties": {
      "date_arrivee": {
        "type": "date",
        "required": true
      },
      "effectif": {
        "type": "number",
        "required": true
      },
      "statut_sanitaire": {
        "type": "object",
        "required": true,
        "properties": {
          "valeur": {
            "type": "string",
            "required": true,
            "enum": ["excellent", "bon", "moyen", "mauvais"]
          },
          "details": {
            "type": "string",
            "required": false
          }
        }
      }
    }
  },
  "planning": {
    "type": "object",
    "required": true,
    "description": "Planification des actions de l’élevage",
    "properties": {
      "periode": {
        "type": "object",
        "required": true,
        "properties": {
          "debut": {
            "type": "date",
            "required": true
          },
          "fin": {
            "type": "date",
            "required": true
          }
        }
      },
      "protocoles": {
        "type": "array",
        "required": false,
        "description": "Liste des protocoles (traitements réguliers)",
        "items": {
          "type": "object",
          "properties": {
            "nom": {
              "type": "string",
              "required": true
            },
            "type": {
              "type": "string",
              "required": true,
              "enum": ["vaccin", "vermifuge", "alimentation", "bilan"]
            },
            "contraintes": {
              "type": "array",
              "required": false,
              "items": {
                "type": "string"
              }
            },
            "frequence_jours": {
              "type": "number",
              "required": true
            },
            "prochain_evenement": {
              "type": "date",
              "required": false
            }
          }
        }
      },
      "evenements": {
        "type": "array",
        "required": false,
        "description": "Liste des événements planifiés dans le planning",
        "items": {
          "type": "object",
          "properties": {
            "nom": {
              "type": "string",
              "required": true
            },
            "type": {
              "type": "string",
              "required": true,
              "enum": ["vaccin", "vermifuge", "alimentation", "bilan"]
            },
            "date_prevue": {
              "type": "date",
              "required": true
            },
            "statut": {
              "type": "string",
              "required": true,
              "enum": ["a_faire", "en_cours", "termine", "annule"]
            },
          }
        }
      }
    }
  }
}
`;

    return {
      systemMessage: `En tant qu'expert vétérinaire, vous DEVEZ :
1. CONSULTER OBLIGATOIREMENT le document : ${REFERENCE_CONFIG[params.animalType].url}
   - Protocoles pages ${REFERENCE_CONFIG[params.animalType].keyPages.protocols.join('-')}
   - Intervalles pages ${REFERENCE_CONFIG[params.animalType].keyPages.intervals.join('-')}

2. PRODUIRE UN STRICT RESPECT de cette structure JSON :
\`\`\`json
${JSON_TEMPLATE}
\`\`\`

3. VALIDER EXPLICITEMENT chaque point :
   - [X] Protocole conforme p.XX
   - [X] Intervalle validé p.XX
   - [ ] Exception documentée p.XX`,

      userPrompt: `Génère un planning ${params.animalType} en STRICTE CONFORMITÉ avec :
- Document: ${REFERENCE_CONFIG[params.animalType].url}
- Structure JSON imposée (voir système)
- Effectif: ${params.animalCount}
- localite  :  ${params.localite}
- Etat des animaux a l'arriver ${params.conditionArriver}

Étapes REQUISES :
1. Lister les pages consultées
2. Noter chaque validation
3. Générer le JSON SANS DEVIATION`,

      examples: {
        validOutput: `{
  "elevage": {
    "type": "bovins",
    "effectif": 120,
    "reference_validation": {
      "document": "${REFERENCE_CONFIG.bovins.url}",
      "pages_verifiees": [12, 18],
      "conformite": true
    },
    "plannings": [
      {
        "periode": {
          "debut": "2024-03-15",
          "fin": "2025-03-15"
        },
        "protocoles": [
          {
            "type": "vaccin",
            "nom": "BVD",
            "reference": "p.14",
            "frequence_jours": 365,
            "dosage": "2ml/animal",
            "contraintes": ["ne pas administrer pendant la gestation"]
          }
        ]
      }
    ]
  }
}`,
      },
    };
  }

  async generatePlaning(generateplaning: GeneratePlaging, user: UserEntity) {
    const prompt = await this.generateStrictPlanningPrompt(generateplaning);
    const model = this.genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
    });
    const { systemMessage } = prompt;
    const chat = model.startChat({
      generationConfig: {
        maxOutputTokens: 5000,
        temperature: 0.2,
        responseMimeType: 'application/json',
      },
    });

    const result = await chat.sendMessage(systemMessage);
    const response = await result.response;
    const text = response.text();
    const dataGenerated = JSON.parse(text);
    const planingGenerated = dataGenerated?.planning;
    console.log(dataGenerated);
    const elevage = await this.planing.createElevage({
      nom: `Elevage de ${generateplaning.animalType}`,
      type: generateplaning.animalType,
      user_id: user._id,
      conditions_initiales: {
        date_arrivee: new Date(),
        effectif: generateplaning.animalCount,
        statut_sanitaire: {
          valeur: 'bon',
        },
      },
      planning: planingGenerated,
    });
    return elevage;
  }
}
