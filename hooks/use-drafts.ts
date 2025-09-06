import { useState, useEffect } from 'react';
import { deleteDraft, listDrafts } from '@/app/actions/drafts';
import { listIntegrations } from '@/app/actions/integrations';
import { publishToPlatforms } from '@/app/actions/integrations/publish';
import { supportedPlatforms } from '@/lib/config/platforms';
import { Draft, DraftsResponse } from '@/lib/types/drafts';
import { usePlan } from './use-plan';
import toast from 'react-hot-toast';

type Integration = {
  id: string;
  platform: string;
  status: string;
  publicationId?: string;
};

export function useDrafts() {
  const { refreshPlanData } = usePlan();
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [publishingDraft, setPublishingDraft] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [draftsResult, integrationsResult] = await Promise.all([
          listDrafts({
            page: 1,
            limit: 100,
          }),
          listIntegrations(),
        ]);

        if (draftsResult.success && draftsResult.data) {
          setDrafts((draftsResult.data as DraftsResponse).drafts);
        }

        if (integrationsResult.success && integrationsResult.data) {
          setIntegrations(integrationsResult.data as Integration[]);
        }
      } catch {
        toast.error('Failed to load drafts');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleDeleteDraft = async (draftId: string) => {
    try {
      const result = await deleteDraft({ id: draftId });

      if (result.success) {
        toast.success('Draft deleted successfully');
        setDrafts(prev => prev.filter(draft => draft.id !== draftId));
      } else {
        toast.error(`Failed to delete draft: ${result.error}`);
      }
    } catch {
      toast.error('Failed to delete draft. Please try again.');
    }
  };

  const handleBulkDelete = async (draftIds: string[]) => {
    try {
      const deletePromises = draftIds.map(draftId =>
        deleteDraft({ id: draftId })
      );
      const results = await Promise.all(deletePromises);

      const successful = results.filter(result => result.success).length;
      const failed = results.filter(result => !result.success).length;

      if (successful > 0) {
        toast.success(`Successfully deleted ${successful} draft(s)`);
        setDrafts(prev => prev.filter(draft => !draftIds.includes(draft.id)));
      }

      if (failed > 0) {
        toast.error(`Failed to delete ${failed} draft(s)`);
      }
    } catch {
      toast.error('Failed to delete draft(s). Please try again.');
    }
  };

  const handlePublishDraft = async (draftId: string) => {
    setPublishingDraft(draftId);
    try {
      const result = await publishToPlatforms({
        draftId,
        platforms: supportedPlatforms,
        options: {
          publishAsDraft: false,
        },
      });

      if (result?.success) {
        const data = result.data as {
          results: Array<{
            platform: string;
            success: boolean;
            platformPostId?: string;
            platformUrl?: string;
            error?: string;
          }>;
          summary: {
            total: number;
            successful: number;
            failed: number;
            draftId: string;
          };
        };

        if (data.summary) {
          const { successful, total } = data.summary;
          if (successful > 0) {
            toast.success(
              `Successfully published to ${successful} out of ${total} platforms!`
            );
          } else {
            const errorMessages = data.results
              .filter(r => !r.success)
              .map(r => {
                let message = `${r.platform}: ${r.error}`;
                if (r.error?.includes('Publication ID is required')) {
                  message +=
                    '\n  → Go to Integrations page and click "Select Publication" to set up your publication ID';
                }
                return message;
              })
              .join('\n\n');
            toast.error(
              `Failed to publish to any platforms:\n\n${errorMessages}`
            );
          }
        }

        const reloadResult = await listDrafts({
          page: 1,
          limit: 100,
        });

        if (reloadResult.success && reloadResult.data) {
          setDrafts((reloadResult.data as DraftsResponse).drafts);
        }

        await refreshPlanData();
      }

      if (!result?.success) {
        toast.error(`Publish failed: ${result?.error}`);
      }
    } catch {
      toast.error('Failed to publish');
    } finally {
      setPublishingDraft(null);
    }
  };

  return {
    drafts,
    loading,
    integrations,
    publishingDraft,
    handleDeleteDraft,
    handleBulkDelete,
    handlePublishDraft,
  };
}
