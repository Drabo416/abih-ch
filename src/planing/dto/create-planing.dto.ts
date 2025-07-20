import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsNumber,
  IsArray,
  ValidateNested,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';

// ==== Interfaces de base ====
class StatutSanitaireDto {
  @IsEnum(['excellent', 'bon', 'moyen', 'mauvais'], {
    message: 'Le statut sanitaire doit être excellent, bon, moyen ou mauvais',
  })
  valeur: string;

  @IsString()
  @IsOptional()
  details?: string;
}

class ConditionsInitialesDto {
  @IsDateString()
  date_arrivee: Date;

  @IsNumber()
  effectif: number;

  @ValidateNested()
  @Type(() => StatutSanitaireDto)
  statut_sanitaire: StatutSanitaireDto;
}

class PeriodeDto {
  @IsDateString()
  debut: Date;

  @IsDateString()
  fin: Date;
}

// ==== Protocoles ====
export class ProtocoleDto {
  @IsString()
  @IsNotEmpty()
  nom: string;

  @IsEnum(['vaccin', 'vermifuge', 'alimentation', 'bilan'])
  type: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  contraintes: string[];

  @IsNumber()
  frequence_jours: number;

  @IsDateString()
  @IsOptional()
  prochain_evenement?: Date;
}

export class CreateProtocoleDto extends ProtocoleDto {}
export class UpdateProtocoleDto extends PartialType(ProtocoleDto) {}

// ==== Interventions ====
export class InterventionDto {
  @IsDateString()
  date_reelle: Date;

  @IsString()
  @IsNotEmpty()
  responsable: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  preuves?: string[];
}

export class CreateInterventionDto extends InterventionDto {}
export class UpdateInterventionDto extends PartialType(InterventionDto) {}

// ==== Evenements ====
export class EvenementDto {
  @IsString()
  @IsNotEmpty()
  nom: string;

  @IsEnum(['vaccin', 'vermifuge', 'alimentation', 'bilan'])
  type: string;

  @IsDateString()
  date_prevue: Date;

  @IsEnum(['a_faire', 'en_cours', 'termine', 'annule'])
  statut: string;

  @ValidateNested()
  @Type(() => InterventionDto)
  @IsOptional()
  intervention?: InterventionDto;
}

export class CreateEvenementDto extends EvenementDto {}
export class UpdateEvenementDto extends PartialType(EvenementDto) {}

// ==== Planning ====
export class PlanningDto {
  @ValidateNested()
  @Type(() => PeriodeDto)
  periode: PeriodeDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProtocoleDto)
  @IsOptional()
  protocoles?: ProtocoleDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EvenementDto)
  @IsOptional()
  evenements?: EvenementDto[];
}

// ==== Elevage Principal ====
export class CreateElevageDto {
  @IsString()
  @IsNotEmpty()
  nom: string;

  @IsEnum(['bovins', 'ovins', 'caprins', 'porcins', 'volailles'])
  type: string;

  @IsString()
  @IsNotEmpty()
  user_id: string;

  @ValidateNested()
  @Type(() => ConditionsInitialesDto)
  conditions_initiales: ConditionsInitialesDto;

  @ValidateNested()
  @Type(() => PlanningDto)
  @IsOptional()
  planning?: PlanningDto;
}

export class UpdateElevageDto extends PartialType(CreateElevageDto) {}

// ==== Filtres ====
export class FilterEvenementsDto {
  @IsEnum(['a_faire', 'en_cours', 'termine', 'annule'])
  @IsOptional()
  statut?: string;
}

export class FilterProtocolesDto {
  @IsEnum(['vaccin', 'vermifuge', 'alimentation', 'bilan'])
  @IsOptional()
  type?: string;
}
