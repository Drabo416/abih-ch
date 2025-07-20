import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CreateElevageDto,
  CreateEvenementDto,
  CreateInterventionDto,
  CreateProtocoleDto,
  UpdateElevageDto,
  UpdateEvenementDto,
  UpdateInterventionDto,
  UpdateProtocoleDto,
} from './dto/create-planing.dto';
import {
  Elevage,
  Evenement,
  Intervention,
  Protocole,
} from './entities/planing.entity';
import { ElevageSchema } from './entities/planing.entity';
@Injectable()
export class PlaningService {
  constructor(
    @InjectModel(Elevage.name) private elevageModel: Model<Elevage>,
  ) {}

  // ===== CRUD Principal =====
  async createElevage(createElevageDto: CreateElevageDto): Promise<Elevage> {
    const createdElevage = new this.elevageModel(createElevageDto);
    return createdElevage.save();
  }

  async findAllByUser(user_id: string): Promise<Elevage[]> {
    return this.elevageModel.find({ user_id }).exec();
  }

  async findOne(id: string): Promise<Elevage> {
    const elevage = await this.elevageModel.findById(id).exec();
    if (!elevage) {
      throw new NotFoundException(`Elevage with ID ${id} not found`);
    }
    return elevage;
  }

  async updateElevage(
    id: string,
    updateElevageDto: UpdateElevageDto,
  ): Promise<Elevage> {
    const existingElevage = await this.elevageModel
      .findByIdAndUpdate(id, updateElevageDto, { new: true })
      .exec();
    if (!existingElevage) {
      throw new NotFoundException(`Elevage with ID ${id} not found`);
    }
    return existingElevage;
  }

  async deleteElevage(id: string): Promise<Elevage> {
    const deletedElevage = await this.elevageModel.findByIdAndDelete(id).exec();
    if (!deletedElevage) {
      throw new NotFoundException(`Elevage with ID ${id} not found`);
    }
    return deletedElevage;
  }

  // ===== Gestion des Protocoles =====
  async addProtocole(
    elevageId: string,
    createProtocoleDto: CreateProtocoleDto,
  ): Promise<Elevage> {
    const protocole: Protocole = {
      ...createProtocoleDto,
      _id: new this.elevageModel()._id,
    };

    return this.elevageModel
      .findByIdAndUpdate(
        elevageId,
        { $push: { 'planning.protocoles': protocole } },
        { new: true },
      )
      .exec();
  }

  async updateProtocole(
    elevageId: string,
    protocoleId: string,
    updateProtocoleDto: UpdateProtocoleDto,
  ): Promise<Elevage> {
    const setObject = this.createUpdateObject('protocoles', updateProtocoleDto);

    return this.elevageModel
      .findOneAndUpdate(
        { _id: elevageId, 'planning.protocoles._id': protocoleId },
        { $set: setObject },
        { new: true },
      )
      .exec();
  }

  async removeProtocole(
    elevageId: string,
    protocoleId: string,
  ): Promise<Elevage> {
    return this.elevageModel
      .findByIdAndUpdate(
        elevageId,
        { $pull: { 'planning.protocoles': { _id: protocoleId } } },
        { new: true },
      )
      .exec();
  }

  // ===== Gestion des Evenements =====
  async addEvenement(
    elevageId: string,
    createEvenementDto: CreateEvenementDto,
  ): Promise<Elevage> {
    const evenement: Evenement = {
      ...createEvenementDto,
      _id: new this.elevageModel()._id,
    };

    return this.elevageModel
      .findByIdAndUpdate(
        elevageId,
        { $push: { 'planning.evenements': evenement } },
        { new: true },
      )
      .exec();
  }

  async updateEvenement(
    elevageId: string,
    evenementId: string,
    updateEvenementDto: UpdateEvenementDto,
  ): Promise<Elevage> {
    const setObject = this.createUpdateObject('evenements', updateEvenementDto);

    return this.elevageModel
      .findOneAndUpdate(
        { _id: elevageId, 'planning.evenements._id': evenementId },
        { $set: setObject },
        { new: true },
      )
      .exec();
  }

  async removeEvenement(
    elevageId: string,
    evenementId: string,
  ): Promise<Elevage> {
    return this.elevageModel
      .findByIdAndUpdate(
        elevageId,
        { $pull: { 'planning.evenements': { _id: evenementId } } },
        { new: true },
      )
      .exec();
  }

  // ===== Gestion des Interventions =====
  async addInterventionToEvenement(
    elevageId: string,
    evenementId: string,
    createInterventionDto: CreateInterventionDto,
  ): Promise<Elevage> {
    const intervention: Intervention = {
      ...createInterventionDto,
    };

    return this.elevageModel
      .findOneAndUpdate(
        { _id: elevageId, 'planning.evenements._id': evenementId },
        { $set: { 'planning.evenements.$.intervention': intervention } },
        { new: true },
      )
      .exec();
  }

  async updateIntervention(
    elevageId: string,
    evenementId: string,
    updateInterventionDto: UpdateInterventionDto,
  ): Promise<Elevage> {
    const setObject = {};
    for (const key in updateInterventionDto) {
      setObject[`planning.evenements.$.intervention.${key}`] =
        updateInterventionDto[key];
    }

    return this.elevageModel
      .findOneAndUpdate(
        { _id: elevageId, 'planning.evenements._id': evenementId },
        { $set: setObject },
        { new: true },
      )
      .exec();
  }

  async removeIntervention(
    elevageId: string,
    evenementId: string,
  ): Promise<Elevage> {
    return this.elevageModel
      .findOneAndUpdate(
        { _id: elevageId, 'planning.evenements._id': evenementId },
        { $unset: { 'planning.evenements.$.intervention': '' } },
        { new: true },
      )
      .exec();
  }

  // ===== Méthodes utilitaires =====
  async findEvenementsByStatus(
    elevageId: string,
    statut?: string,
  ): Promise<Evenement[]> {
    const elevage = await this.elevageModel
      .findById(elevageId)
      .select('planning.evenements')
      .exec();

    if (!elevage?.planning?.evenements) {
      return [];
    }

    return statut
      ? elevage.planning.evenements.filter((e) => e.statut === statut)
      : elevage.planning.evenements;
  }

  async findProtocolesByType(
    elevageId: string,
    type?: string,
  ): Promise<Protocole[]> {
    const elevage = await this.elevageModel
      .findById(elevageId)
      .select('planning.protocoles')
      .exec();

    if (!elevage?.planning?.protocoles) {
      return [];
    }

    return type
      ? elevage.planning.protocoles.filter((p) => p.type === type)
      : elevage.planning.protocoles;
  }

  // ===== Méthodes privées =====
  private createUpdateObject(
    field: 'protocoles' | 'evenements',
    dto: any,
  ): Record<string, any> {
    const setObject = {};
    for (const key in dto) {
      if (dto[key] !== undefined) {
        setObject[`planning.${field}.$.${key}`] = dto[key];
      }
    }
    return setObject;
  }
}
