// animal-type.enum.ts
export enum AnimalType {
  BOVINS = 'bovins',
  OVINS = 'ovins',
  CAPRINS = 'caprins',
  PORCINS = 'porcins',
  VOLAILLES = 'volailles',
}

// sante-animal.enum.ts
export enum SanteAnimal {
  EXCELLENT = 'excellent',
  BON = 'bon',
  MOYEN = 'moyen',
  MAUVAIS = 'mauvais',
}

// event-type.enum.ts
export enum EventType {
  VACCIN = 'vaccin',
  VERMIFUGE = 'vermifuge',
  ALIMENTATION = 'alimentation',
  BILAN = 'bilan',
  AUTRE = 'autre',
}

// event-status.enum.ts
export enum EventStatus {
  A_FAIRE = 'a_faire',
  EN_COURS = 'en_cours',
  TERMINE = 'termine',
  ANNULE = 'annule',
}

// intervention-status.enum.ts
export enum InterventionStatus {
  REUSSI = 'reussi',
  ECHEC = 'echec',
  PARTIEL = 'partiel',
}
