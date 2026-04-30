import { Type } from 'class-transformer';
import {
  IsArray,
  IsDefined,
  IsIn,
  IsString,
  ValidateNested,
  IsOptional,
} from 'class-validator';

export class Collaborators {
  @IsDefined()
  @IsString()
  label: string;
}
export class InstagramDto {
  @IsIn(['post', 'story'])
  @IsDefined()
  post_type: 'post' | 'story';

  @IsOptional()
  is_trial_reel?: boolean;

  @IsIn(['MANUAL', 'SS_PERFORMANCE'])
  @IsOptional()
  graduation_strategy?: 'MANUAL' | 'SS_PERFORMANCE';

  @Type(() => Collaborators)
  @ValidateNested({ each: true })
  @IsArray()
  @IsOptional()
  collaborators: Collaborators[];

  @IsOptional()
  location_id?: string;

  @IsOptional()
  branded_content_tag?: string;

  @IsOptional()
  product_tags?: Array<Record<string, any>>;

  @IsOptional()
  audio_clip_id?: string;
}
