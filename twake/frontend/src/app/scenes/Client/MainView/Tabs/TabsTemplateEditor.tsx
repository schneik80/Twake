import React, { useState, useEffect } from 'react';
import { Button, Row, Input, Select } from 'antd';

import { Application, AppType } from 'app/models/App';
import Groups from 'services/workspaces/groups.js';
import { TabType } from 'app/models/Tab';
import Icon from 'app/components/Icon/Icon';
import ModalManager from 'app/components/Modal/ModalManager';
import ObjectModal from 'components/ObjectModal/ObjectModal';
import WorkspacesApps from 'services/workspaces/workspaces_apps.js';
import Languages from 'services/languages/languages';
import { getCompanyApplications } from 'app/state/recoil/atoms/CompanyApplications';
import { useCompanyApplications } from 'app/state/recoil/hooks/useCompanyApplications';
import { useCurrentCompany } from 'app/state/recoil/hooks/useCompanies';

const { Option } = Select;

type PropsType = {
  tab?: TabType;
  onChangeTabs?: any;
  currentUserId?: string;
};

export default (props: PropsType): JSX.Element => {
  const [appId, setAppId] = useState<string>(props.tab?.application_id || '');
  const [tabName, setTabName] = useState<string>(props.tab?.name || '');
  const [workspacesApps, setWorkspacesApps] = useState<AppType[]>([]);
  const { company } = useCurrentCompany();

  const { applications: companyApplications } = useCompanyApplications(company?.id || '');

  useEffect(() => {
    generateWorkspacesApps();
  }, []);

  const generateWorkspacesApps = () => {
    const apps: AppType[] = getCompanyApplications(Groups.currentGroupId);
    return setWorkspacesApps(apps);
  };

  return (
    <ObjectModal
      title={
        props.tab?.id
          ? Languages.t('scenes.client.mainview.tabs.tabstemplateeditor.title_tab_edition', [
              props.tab?.name,
            ])
          : Languages.t('scenes.client.mainview.tabs.tabstemplateeditor.title_tab_creation')
      }
      closable
      footer={
        <Button
          type="primary"
          disabled={!appId}
          onClick={() => {
            let editedTab: TabType | undefined = props.tab;

            ModalManager.closeAll();

            if (editedTab?.id) {
              editedTab = {
                ...editedTab,
                name: tabName,
              };
            } else {
              editedTab = {
                name: tabName,
                order: '' + new Date().getTime(),
                owner: props.currentUserId,
                application_id: appId,
                configuration: {},
              };
            }

            return props.onChangeTabs(editedTab);
          }}
        >
          {Languages.t(props.tab?.id ? 'general.edit' : 'general.create')}
        </Button>
      }
    >
      <div className="x-margin">
        <Row justify="center" className="bottom-margin">
          <Input
            size={'large'}
            maxLength={30}
            value={tabName}
            onChange={(e: { target: { value: string } }) => setTabName(e.target.value)}
            className="medium full_width bottom-margin"
            type="text"
            placeholder="Tab name"
          />
        </Row>
        {!props.tab?.id && (
          <Row justify="start">
            <Select
              size={'large'}
              onChange={(value: string) => setAppId(value)}
              value={appId ? appId : undefined}
              placeholder={Languages.t(
                'scenes.client.mainview.tabs.tabstemplateeditor.select_placeholder',
              )}
            >
              {companyApplications
                .filter((app: Application) => app.display?.twake?.tab)
                .map((app: Application) => {
                  return (
                    <Option key={`key_${app.id}`} value={app.id || ''}>
                      <Icon type={WorkspacesApps.getAppIcon(app)} /> {app.identity.name}
                    </Option>
                  );
                })}
            </Select>
          </Row>
        )}
      </div>
    </ObjectModal>
  );
};
