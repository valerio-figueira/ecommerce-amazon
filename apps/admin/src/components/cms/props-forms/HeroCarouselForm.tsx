'use client';

import { Eye, EyeOff, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useFormContext, useWatch, type Control } from 'react-hook-form';

import type { BlockFormValues } from '@/components/cms/forms/BlockPropsForm';
import { CmsFormSection } from '@/components/cms/props-forms/CmsFormSection';
import {
  INTERVAL_MS_OPTIONS,
  getSlideButtonMode,
  readUnknownArrayItem,
  type HeroSlideFormValue,
} from '@/components/cms/props-forms/block-form-registry';
import { ProductPicker } from '@/components/cms/props-forms/ProductPicker';
import { Button } from '@/components/ui/button';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ProductPickerOption } from '@/lib/api/cms-pages-client';
import { cn } from '@/lib/utils';

type HeroCarouselFormProps = {
  control: Control<BlockFormValues>;
  products: ProductPickerOption[];
};

function readString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function readBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function readNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

const DEFAULT_SLIDE: HeroSlideFormValue = {
  imageUrl: 'https://placehold.co/1200x800?text=Slide',
  title: 'Novo slide',
  subtitle: '',
  buttonMode: 'none',
};

function readSlideList(value: unknown): HeroSlideFormValue[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is HeroSlideFormValue => typeof item === 'object' && item !== null);
}

type HeroSlideCardProps = {
  index: number;
  control: Control<BlockFormValues>;
  products: ProductPickerOption[];
  buttonMode: ReturnType<typeof getSlideButtonMode>;
  previewTitle: string;
  canRemove: boolean;
  onRemove: () => void;
};

function HeroSlideCard({
  index,
  control,
  products,
  buttonMode,
  previewTitle,
  canRemove,
  onRemove,
}: HeroSlideCardProps): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={cn('cms-slide-card', !isOpen && 'is-collapsed')}>
      <div className="cms-slide-card-header">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[var(--admin-navy-deep)]">Slide {index + 1}</p>
          {!isOpen && previewTitle && (
            <p className="truncate text-xs text-[var(--admin-text-muted)]">{previewTitle}</p>
          )}
        </div>
        <div className="cms-slide-card-actions">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="cms-slide-card-toggle"
            onClick={() => setIsOpen((open) => !open)}
            aria-expanded={isOpen}
            aria-label={isOpen ? `Ocultar slide ${index + 1}` : `Mostrar slide ${index + 1}`}
            title={isOpen ? 'Ocultar' : 'Mostrar'}
          >
            {isOpen ? (
              <EyeOff className="h-4 w-4" aria-hidden />
            ) : (
              <Eye className="h-4 w-4" aria-hidden />
            )}
          </Button>
          {canRemove && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Remover
            </Button>
          )}
        </div>
      </div>

      {isOpen && (
        <div className="mt-3 space-y-3">
          <FormField
            control={control}
            name={`slides.${index}.imageUrl`}
            render={({ field: imageField }) => (
              <FormItem>
                <FormLabel>Imagem de fundo</FormLabel>
                <FormControl>
                  <Input {...imageField} value={readString(imageField.value)} />
                </FormControl>
                <FormDescription>Cole o link da foto (1200×800 recomendado).</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name={`slides.${index}.title`}
            render={({ field: titleField }) => (
              <FormItem>
                <FormLabel>Título principal</FormLabel>
                <FormControl>
                  <Input {...titleField} value={readString(titleField.value)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name={`slides.${index}.subtitle`}
            render={({ field: subtitleField }) => (
              <FormItem>
                <FormLabel>Subtítulo (opcional)</FormLabel>
                <FormControl>
                  <Input {...subtitleField} value={readString(subtitleField.value)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name={`slides.${index}.buttonMode`}
            render={({ field: modeField }) => (
              <FormItem>
                <FormLabel>Destino do botão</FormLabel>
                <Select
                  value={readString(modeField.value) || 'none'}
                  onValueChange={modeField.onChange}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">Sem botão</SelectItem>
                    <SelectItem value="link">Link para página ou coleção</SelectItem>
                    <SelectItem value="product">Destacar um produto</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {buttonMode === 'link' && (
            <div className="space-y-3 rounded-lg border border-[var(--admin-gray)] bg-[var(--admin-bg)] p-3">
              <FormField
                control={control}
                name={`slides.${index}.ctaLabel`}
                render={({ field: labelField }) => (
                  <FormItem>
                    <FormLabel>Texto do botão</FormLabel>
                    <FormControl>
                      <Input
                        {...labelField}
                        value={readString(labelField.value)}
                        placeholder="Ex: Ver coleção"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name={`slides.${index}.ctaHref`}
                render={({ field: hrefField }) => (
                  <FormItem>
                    <FormLabel>Endereço do link</FormLabel>
                    <FormControl>
                      <Input
                        {...hrefField}
                        value={readString(hrefField.value)}
                        placeholder="/colecoes/setup-gamer ou https://…"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {buttonMode === 'product' && (
            <div className="space-y-3 rounded-lg border border-[var(--admin-gray)] bg-[var(--admin-bg)] p-3">
              <FormField
                control={control}
                name={`slides.${index}.linkedProductSlug`}
                render={({ field: slugField }) => (
                  <FormItem>
                    <FormLabel>Produto em destaque</FormLabel>
                    <FormControl>
                      <ProductPicker
                        products={products}
                        value={readString(slugField.value)}
                        onChange={slugField.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name={`slides.${index}.ctaLabel`}
                render={({ field: labelField }) => (
                  <FormItem>
                    <FormLabel>Texto do botão (opcional)</FormLabel>
                    <FormControl>
                      <Input
                        {...labelField}
                        value={readString(labelField.value)}
                        placeholder="Ver produto"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function HeroCarouselForm({
  control,
  products,
}: HeroCarouselFormProps): React.JSX.Element {
  const { setValue } = useFormContext<BlockFormValues>();
  const watchedSlides = useWatch({ control, name: 'slides' });
  const slideList = readSlideList(watchedSlides);

  function appendSlide(): void {
    setValue('slides', [...slideList, DEFAULT_SLIDE], { shouldDirty: true });
  }

  function removeSlide(index: number): void {
    setValue(
      'slides',
      slideList.filter((_, slideIndex) => slideIndex !== index),
      { shouldDirty: true },
    );
  }

  return (
    <div className="space-y-6">
      <CmsFormSection title="Slides do carrossel">
        <div className="space-y-4">
          {slideList.map((slide, index) => {
            const buttonMode = getSlideButtonMode(readUnknownArrayItem(watchedSlides, index));
            const previewTitle = readString(slide['title']);

            return (
              <HeroSlideCard
                key={`slide-${index}`}
                index={index}
                control={control}
                products={products}
                buttonMode={buttonMode}
                previewTitle={previewTitle}
                canRemove={slideList.length > 1}
                onRemove={() => removeSlide(index)}
              />
            );
          })}
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-3"
          onClick={appendSlide}
        >
          <Plus className="h-4 w-4" />
          Adicionar slide
        </Button>
      </CmsFormSection>

      <CmsFormSection title="Comportamento" className="cms-form-section-divider">
        <FormField
          control={control}
          name="autoplay"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Troca automática de slides</FormLabel>
              <Select
                value={readBoolean(field.value, true) ? 'yes' : 'no'}
                onValueChange={(value) => field.onChange(value === 'yes')}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="yes">Sim</SelectItem>
                  <SelectItem value="no">Não</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="intervalMs"
          render={({ field }) => {
            const current = readNumber(field.value, 6000);
            const matched = INTERVAL_MS_OPTIONS.some((option) => option.value === current);
            return (
              <FormItem>
                <FormLabel>Velocidade da troca</FormLabel>
                <Select
                  value={String(matched ? current : 6000)}
                  onValueChange={(value) => field.onChange(Number(value))}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {INTERVAL_MS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={String(option.value)}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            );
          }}
        />
      </CmsFormSection>
    </div>
  );
}
