import { IsIn } from 'class-validator';

export type Locale = 'es' | 'en';

export class UpdateLocaleDto {
  @IsIn(['es', 'en'], { message: "El idioma debe ser 'es' o 'en'." })
  locale!: Locale;
}