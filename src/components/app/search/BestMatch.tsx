import { View } from '@/application/types';
import { notify } from '@/components/_shared/notify';
import { findView } from '@/components/_shared/outline/utils';
import { useAppOutline, useCurrentWorkspaceId } from '@/components/app/app.hooks';
import ViewList from '@/components/app/search/ViewList';
import { useService } from '@/components/main/app.hooks';
import { debounce } from 'lodash-es';
import React, { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

function BestMatch ({
  onClose,
  searchValue
}: {
  onClose: () => void;
  searchValue: string;
}) {
  const [views, setViews] = React.useState<View[]>([]);
  const { t } = useTranslation();
  const outline = useAppOutline();
  const [loading, setLoading] = React.useState<boolean>(false);
  const service = useService();
  const currentWorkspaceId = useCurrentWorkspaceId()
  const handleSearch = useCallback(async (searchTerm: string) => {
    if (!outline) return;
    if (!currentWorkspaceId || !service) return;
    if (!searchTerm) {
      setViews([]);
      return;
    }

    setLoading(true)

    try {
      const res = await service.searchWorkspace(currentWorkspaceId, searchTerm);
      const views = res.map(id => {
        return findView(outline, id);
      });

      setViews(views.filter(Boolean) as View[]);
      // eslint-disable-next-line
    } catch (e: any) {
      notify.error(e.message);
    }

    setLoading(false);
    
  }, [currentWorkspaceId, outline, service]);

  const debounceSearch = useMemo(() => {
    return debounce(handleSearch, 300);
  }, [handleSearch]);
  
  useEffect(() => {
    void debounceSearch(searchValue);
  }, [searchValue, debounceSearch]);


  return <ViewList views={views} title={t('commandPalette.bestMatches')} onClose={onClose} loading={loading} />
}

export default BestMatch;