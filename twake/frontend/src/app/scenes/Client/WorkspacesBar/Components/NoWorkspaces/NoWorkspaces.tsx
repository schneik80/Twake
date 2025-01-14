import React, { Suspense } from 'react';
import LoginService from 'app/services/login/LoginService';
import Languages from 'services/languages/languages';
import CompanySelector, { CurrentCompanyLogo } from '../CompanySelector/index';
import { Button } from 'antd';
import { useCurrentUser } from 'app/state/recoil/hooks/useCurrentUser';
import { useCurrentCompany } from 'app/state/recoil/hooks/useCompanies';
import './style.scss';
import InitService from 'app/services/InitService';

export default () => {
  const retry = () => {
    document.location.reload();
  };
  const { company } = useCurrentCompany();

  return (
    <Suspense fallback={<></>}>
      <div className="welcomePage">
        <div className=" skew_in_top_nobounce">
          <div className="">
            <div className="subtitle">
              <CurrentCompanyLogo />
              {Languages.t('scenes.app.workspaces.welcome_page.added_to_company')}{' '}
              <b>{company?.name}</b>.
              <br />
              {Languages.t('scenes.app.workspaces.welcome_page.no_workspace_subtitle')}
            </div>

            <div className="retry">
              {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
              <a href="#" className="link" onClick={() => retry()}>
                {Languages.t('scenes.app.workspaces.welcome_page.try_again')}
              </a>
              <br />
              <br />

              {InitService.server_infos?.configuration?.accounts?.type === 'console' && (
                <ChangeCompany />
              )}

              <br />

              {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
              <a className="blue_link" onClick={() => LoginService.logout()}>
                {Languages.t('scenes.apps.account.account.logout')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </Suspense>
  );
};

export const ChangeCompany = () => {
  const { user } = useCurrentUser();

  if (user?.companies?.length === 0) {
    return <></>;
  }

  return (
    <div>
      <CompanySelector>
        <Button type="ghost">
          {Languages.t('scenes.app.workspacesbar.components.change_company_title')}
        </Button>
      </CompanySelector>
    </div>
  );
};
