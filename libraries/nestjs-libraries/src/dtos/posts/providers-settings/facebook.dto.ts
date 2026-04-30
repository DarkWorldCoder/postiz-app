import { IsOptional, ValidateIf, IsUrl } from 'class-validator';

export class FacebookDto {
  @IsOptional()
  @ValidateIf(p => p.url)
  @IsUrl()
  url?: string;

  @IsOptional()
  scheduled_publish_time?: number;

  @IsOptional()
  crosspost_pages?: string[];
}
