// src/elevage/schemas/elevage.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Mongoose } from 'mongoose';

@Schema({ _id: true })
export class Intervention {
  @Prop({ required: true })
  date_reelle: Date;

  @Prop({ required: true })
  responsable: string;

  @Prop()
  notes?: string;

  @Prop({ type: [String] })
  preuves?: string[];
}

const InterventionSchema = SchemaFactory.createForClass(Intervention);

@Schema({ _id: true })
export class Evenement {
  _id?: any;
  @Prop({ required: true })
  nom: string;

  @Prop({
    required: true,
    enum: ['vaccin', 'vermifuge', 'alimentation', 'bilan'],
  })
  type: string;

  @Prop({ required: true })
  date_prevue: Date;

  @Prop({ required: true, enum: ['a_faire', 'en_cours', 'termine', 'annule'] })
  statut: string;

  @Prop({ type: InterventionSchema })
  intervention?: Intervention;
}

const EvenementSchema = SchemaFactory.createForClass(Evenement);

@Schema({ _id: true })
export class Protocole {
  _id: any;
  @Prop({ required: true })
  nom: string;

  @Prop({
    required: true,
    enum: ['vaccin', 'vermifuge', 'alimentation', 'bilan'],
  })
  type: string;

  @Prop()
  contraintes: string[];

  @Prop({ required: true })
  frequence_jours: number;

  @Prop()
  prochain_evenement?: Date;
}

const ProtocoleSchema = SchemaFactory.createForClass(Protocole);

@Schema({ _id: false })
export class Planning {
  _id?: any;
  @Prop({
    type: {
      debut: Date,
      fin: Date,
    },
    required: true,
  })
  periode: { debut: Date; fin: Date };

  @Prop({ type: [ProtocoleSchema], default: [] })
  protocoles: Protocole[];

  @Prop({ type: [EvenementSchema], default: [] })
  evenements: Evenement[];
}

const PlanningSchema = SchemaFactory.createForClass(Planning);

@Schema({ timestamps: true })
export class Elevage extends Document {
  @Prop({ required: true })
  nom: string;

  @Prop({
    required: true,
    enum: ['bovins', 'ovins', 'caprins', 'porcins', 'volailles'],
  })
  type: string;

  @Prop({ required: true })
  user_id: string;

  @Prop({
    type: {
      date_arrivee: Date,
      effectif: Number,
      statut_sanitaire: {
        valeur: {
          type: String,
          enum: ['excellent', 'bon', 'moyen', 'mauvais'],
        },
        details: String,
      },
    },
    required: true,
  })
  conditions_initiales: Record<string, any>;

  @Prop({ type: PlanningSchema })
  planning: Planning;
}

export const ElevageSchema = SchemaFactory.createForClass(Elevage);
