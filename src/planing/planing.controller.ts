import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { PlaningService } from './planing.service';
import {
  CreateElevageDto,
  CreateEvenementDto,
  CreateInterventionDto,
  CreateProtocoleDto,
  FilterEvenementsDto,
  FilterProtocolesDto,
  UpdateElevageDto,
  UpdateEvenementDto,
  UpdateInterventionDto,
  UpdateProtocoleDto,
} from './dto/create-planing.dto';

@Controller('planning')
export class PlaningController {
  constructor(private readonly service: PlaningService) {}

  // ==== CRUD Principal ====
  @Post()
  create(@Body() dto: CreateElevageDto) {
    return this.service.createElevage(dto);
  }

  @Get()
  findAllByUser(@Query('user_id') userId: string) {
    return this.service.findAllByUser(userId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateElevageDto,
  ) {
    return this.service.updateElevage(id, dto);
  }

  @Delete(':id')
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.deleteElevage(id);
  }

  // ==== Protocoles ====
  @Post(':id/protocoles')
  addProtocole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateProtocoleDto,
  ) {
    return this.service.addProtocole(id, dto);
  }

  @Put(':id/protocoles/:protocoleId')
  updateProtocole(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('protocoleId', ParseUUIDPipe) protocoleId: string,
    @Body() dto: UpdateProtocoleDto,
  ) {
    return this.service.updateProtocole(id, protocoleId, dto);
  }

  @Delete(':id/protocoles/:protocoleId')
  removeProtocole(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('protocoleId', ParseUUIDPipe) protocoleId: string,
  ) {
    return this.service.removeProtocole(id, protocoleId);
  }

  // ==== Evenements ====
  @Post(':id/evenements')
  addEvenement(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateEvenementDto,
  ) {
    return this.service.addEvenement(id, dto);
  }

  @Put(':id/evenements/:evenementId')
  updateEvenement(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('evenementId', ParseUUIDPipe) evenementId: string,
    @Body() dto: UpdateEvenementDto,
  ) {
    return this.service.updateEvenement(id, evenementId, dto);
  }

  @Delete(':id/evenements/:evenementId')
  removeEvenement(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('evenementId', ParseUUIDPipe) evenementId: string,
  ) {
    return this.service.removeEvenement(id, evenementId);
  }

  // ==== Interventions ====
  @Post(':id/evenements/:evenementId/intervention')
  addIntervention(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('evenementId', ParseUUIDPipe) evenementId: string,
    @Body() dto: CreateInterventionDto,
  ) {
    return this.service.addInterventionToEvenement(id, evenementId, dto);
  }

  @Put(':id/evenements/:evenementId/intervention')
  updateIntervention(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('evenementId', ParseUUIDPipe) evenementId: string,
    @Body() dto: UpdateInterventionDto,
  ) {
    return this.service.updateIntervention(id, evenementId, dto);
  }

  @Delete(':id/evenements/:evenementId/intervention')
  removeIntervention(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('evenementId', ParseUUIDPipe) evenementId: string,
  ) {
    return this.service.removeIntervention(id, evenementId);
  }

  // ==== Filtres ====
  @Get(':id/evenements')
  filterEvenements(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() filter: FilterEvenementsDto,
  ) {
    return this.service.findEvenementsByStatus(id, filter.statut);
  }

  @Get(':id/protocoles')
  filterProtocoles(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() filter: FilterProtocolesDto,
  ) {
    return this.service.findProtocolesByType(id, filter.type);
  }
}
