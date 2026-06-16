'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Briefcase, Mail, UserRound } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAdminToast } from '@/components/ui/admin-toast';
import { updateOperatorProfileClient } from '@/lib/api/profile-client';
import type { OperatorProfile } from '@ecommerce-amazon/shared/admin';

const profileFormSchema = z.object({
  name: z.string().trim().min(1, 'Informe o nome.').max(120, 'Máximo de 120 caracteres.'),
  bio: z.string().trim().max(250, 'Máximo de 250 caracteres.'),
  jobTitle: z.string().trim().max(120, 'Máximo de 120 caracteres.'),
  showOnTeam: z.boolean(),
  publicTeamRole: z.enum(['founder', 'member']),
  linkedin: z.string().trim().url('URL inválida.').or(z.literal('')),
  instagram: z.string().trim().url('URL inválida.').or(z.literal('')),
  x: z.string().trim().url('URL inválida.').or(z.literal('')),
  telegram: z.string().trim().url('URL inválida.').or(z.literal('')),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const ROLE_LABELS: Record<OperatorProfile['role'], string> = {
  admin: 'Administrador',
  editor: 'Editor',
};

const STATUS_LABELS: Record<OperatorProfile['status'], string> = {
  active: 'Ativo',
  disabled: 'Inativo',
};

type ProfileFormProps = {
  profile: OperatorProfile;
};

function buildSocialLinks(values: ProfileFormValues) {
  const links = {
    ...(values.linkedin ? { linkedin: values.linkedin } : {}),
    ...(values.instagram ? { instagram: values.instagram } : {}),
    ...(values.x ? { x: values.x } : {}),
    ...(values.telegram ? { telegram: values.telegram } : {}),
  };
  return Object.keys(links).length > 0 ? links : null;
}

export function ProfileForm({ profile }: ProfileFormProps): React.JSX.Element {
  const router = useRouter();
  const adminToast = useAdminToast();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: profile.name,
      bio: profile.bio ?? '',
      jobTitle: profile.jobTitle ?? '',
      showOnTeam: profile.showOnTeam,
      publicTeamRole: profile.publicTeamRole,
      linkedin: profile.socialLinks?.linkedin ?? '',
      instagram: profile.socialLinks?.instagram ?? '',
      x: profile.socialLinks?.x ?? '',
      telegram: profile.socialLinks?.telegram ?? '',
    },
  });

  async function onSubmit(values: ProfileFormValues): Promise<void> {
    try {
      await updateOperatorProfileClient({
        name: values.name,
        bio: values.bio.trim() ? values.bio.trim() : null,
        jobTitle: values.jobTitle.trim() ? values.jobTitle.trim() : null,
        socialLinks: buildSocialLinks(values),
        showOnTeam: values.showOnTeam,
        publicTeamRole: values.publicTeamRole,
      });
      adminToast.success('Perfil atualizado.');
      router.refresh();
    } catch (error) {
      adminToast.error(error instanceof Error ? error.message : 'Falha ao salvar perfil');
    }
  }

  return (
    <div className="admin-profile-form-column">
      <Form {...form}>
        <form
          className="admin-profile-form"
          onSubmit={(event) => {
            void form.handleSubmit(onSubmit)(event);
          }}
          autoComplete="off"
        >
          <div className="admin-profile-block">
            <h3 className="admin-profile-block-title" id="profile-block-ident">
              Identificação
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-[color:var(--admin-navy)]" htmlFor="profile-email">
                  E-mail (início de sessão)
                </label>
                <div className="admin-profile-input-group mt-1.5">
                  <span className="admin-profile-input-addon" aria-hidden="true">
                    <Mail className="size-4 text-[color:var(--admin-text-muted)]" />
                  </span>
                  <Input
                    id="profile-email"
                    type="email"
                    value={profile.email}
                    disabled
                    readOnly
                    aria-describedby="profile-email-note"
                  />
                </div>
                <p id="profile-email-note" className="mt-1.5 text-xs text-[color:var(--admin-text-muted)]">
                  Este endereço é o identificador de acesso e não pode ser alterado nesta página.
                </p>
              </div>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome completo</FormLabel>
                    <FormControl>
                      <Input {...field} maxLength={120} autoComplete="name" />
                    </FormControl>
                    <FormDescription>
                      Aparece no cabeçalho do painel e na caixa de autor dos artigos.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="admin-profile-block">
            <h3 className="admin-profile-block-title" id="profile-block-about">
              Sobre
            </h3>
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio curta</FormLabel>
                  <FormControl>
                    <textarea
                      {...field}
                      maxLength={250}
                      rows={4}
                      className="flex min-h-[6rem] w-full rounded-lg border border-[color:var(--admin-gray)] bg-white px-3 py-2 text-sm text-[color:var(--admin-navy)] shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--admin-primary)]"
                      placeholder="Texto exibido no rodapé dos artigos publicados."
                    />
                  </FormControl>
                  <FormDescription>Máximo de 250 caracteres.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="admin-profile-block">
            <h3 className="admin-profile-block-title" id="profile-block-public">
              Perfil público (página Sobre)
            </h3>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="showOnTeam"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-3 space-y-0">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4 rounded border-[color:var(--admin-gray)]"
                      />
                    </FormControl>
                    <div>
                      <FormLabel>Exibir na página Sobre</FormLabel>
                      <FormDescription>
                        Seu nome, cargo, bio e foto aparecerão na seção &quot;Quem somos&quot;.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="jobTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cargo público</FormLabel>
                    <FormControl>
                      <Input {...field} maxLength={120} placeholder="Ex.: Editor de reviews" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="publicTeamRole"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Papel no JSON-LD</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="flex h-10 w-full rounded-lg border border-[color:var(--admin-gray)] bg-white px-3 text-sm"
                      >
                        <option value="member">Membro da equipe</option>
                        <option value="founder">Fundador</option>
                      </select>
                    </FormControl>
                    <FormDescription>
                      Usado pelos buscadores para vincular você à organização.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                {(['linkedin', 'instagram', 'x', 'telegram'] as const).map((network) => (
                  <FormField
                    key={network}
                    control={form.control}
                    name={network}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="capitalize">{network === 'x' ? 'X (Twitter)' : network}</FormLabel>
                        <FormControl>
                          <Input {...field} type="url" placeholder="https://" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="admin-profile-block">
            <h3 className="admin-profile-block-title" id="profile-block-account">
              Conta
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--admin-text-muted)]">
                  Papel
                </p>
                <div className="admin-profile-input-group mt-1.5">
                  <span className="admin-profile-input-addon" aria-hidden="true">
                    <Briefcase className="size-4 text-[color:var(--admin-text-muted)]" />
                  </span>
                  <Input value={ROLE_LABELS[profile.role]} disabled readOnly />
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--admin-text-muted)]">
                  Status
                </p>
                <div className="admin-profile-input-group mt-1.5">
                  <span className="admin-profile-input-addon" aria-hidden="true">
                    <UserRound className="size-4 text-[color:var(--admin-text-muted)]" />
                  </span>
                  <Input value={STATUS_LABELS[profile.status]} disabled readOnly />
                </div>
              </div>
            </div>
          </div>

          <div className="admin-profile-form-actions">
            <Button type="submit" className="min-h-11 px-6" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Salvando…' : 'Salvar alterações'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
