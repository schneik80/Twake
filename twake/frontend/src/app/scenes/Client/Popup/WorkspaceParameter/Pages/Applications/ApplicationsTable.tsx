import React, { useEffect, useState } from 'react';

import { ColumnsType } from 'antd/lib/table';
import useBreakpoint from 'antd/lib/grid/hooks/useBreakpoint';
import { Divider, Table, Typography, Row, Input, Col, Button } from 'antd';

import { Application } from 'app/models/App';
import Languages from 'services/languages/languages';
import { useApplications } from 'app/state/recoil/hooks/useApplications';
import { useCompanyApplications } from 'app/state/recoil/hooks/useCompanyApplications';
import { useCurrentCompany } from 'app/state/recoil/hooks/useCompanies';
import { delayRequest } from 'app/services/utils/managedSearchRequest';
import AvatarComponent from 'app/components/Avatar/Avatar';

import './ApplicationsStyles.scss';

type ColumnObjectType = { key: number } & Application;
const DEFAULT_PAGE_SIZE = 20;

export default () => {
  const { company } = useCurrentCompany();

  if (!company?.id) return <></>;

  const {
    applications: applicationsList,
    loading: isLoadingApplicationsList,
    search,
  } = useApplications();
  const { loading, applications, add } = useCompanyApplications(company.id);

  const [data, _setData] = useState<ColumnObjectType[]>([]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { xs, sm } = useBreakpoint();

  useEffect(() => {
    refreshApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationsList]);

  const refreshApplications = () => {
    applicationsList && setData(applicationsList);
  };

  const setData = (list: Application[]) => {
    if (list) {
      _setData(
        list.map((app, key) => ({
          key: key + 1,
          name: { name: app.identity.name, icon: app.identity.icon },
          description: app.identity.description,
          installed: loading,
          ...app,
        })),
      );
    }
  };

  const onClickButton = async (application: Application) => add(application.id);

  const columns: ColumnsType<ColumnObjectType> = [
    {
      title: Languages.t('scenes.app.integrations_parameters.applications_table.name'),
      dataIndex: 'name',
      width: 550,
      render: (
        { name, icon }: { name: string; icon: string },
        record: ColumnObjectType,
        index: number,
      ) => (
        <Row key={index} wrap={false} align="middle" justify="start">
          <AvatarComponent url={icon} />
          <Typography.Text className="small-x-margin">{name}</Typography.Text>
        </Row>
      ),
    },
    {
      dataIndex: 'actions',
      render: (initialValue: any, record: ColumnObjectType, index: number) => {
        const { key, ...application } = record;
        return (
          <Button
            key={key}
            loading={loading}
            type="ghost"
            className="applications-table-actions-btn"
            onClick={() => onClickButton(application)}
          >
            Install
          </Button>
        );
      },
    },
  ];

  return (
    <>
      <Row>
        <Divider />
      </Row>
      <Row justify="space-between" wrap={false} className="small-bottom-margin">
        <Col>
          <Typography.Title level={3} style={{ margin: 0 }}>
            {Languages.t('scenes.app.integrations_parameters.applications_table.title')}
          </Typography.Title>
        </Col>
        <Col>
          <Input
            placeholder={Languages.t(
              'scenes.app.integrations_parameters.applications_table.search_placeholder',
            )}
            onChange={e => {
              const value = e.target?.value;
              delayRequest('application_search', async () => await search(value));
            }}
          />
        </Col>
      </Row>

      <div>
        <Table
          columns={columns}
          loading={isLoadingApplicationsList}
          dataSource={data.filter(app => !applications.map(a => a.id).includes(app.id))}
          size="small"
          pagination={{ pageSize: DEFAULT_PAGE_SIZE, simple: true }}
          scroll={{ x: xs || sm ? true : undefined }}
        />
      </div>
    </>
  );
};
