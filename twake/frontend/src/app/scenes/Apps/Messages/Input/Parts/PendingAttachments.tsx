import React, { useEffect } from 'react';
import { Col, Row } from 'antd';
import { useUploadZones } from 'app/state/recoil/hooks/useUploadZones';
import '../Input.scss';
import { MessageFileType } from 'app/models/Message';
import _ from 'lodash';
import PossiblyPendingAttachment from '../../Message/Parts/PossiblyPendingAttachment';

type PropsType = {
  zoneId: string;
  initialValue?: MessageFileType[];
  onChange?: (list: MessageFileType[]) => void;
};

export default ({ zoneId, onChange, initialValue }: PropsType) => {
  const { files, setFiles } = useUploadZones(zoneId);

  useEffect(() => {
    if (initialValue) setFiles(initialValue.filter(f => f?.metadata?.source !== 'pending'));
  }, []);

  useEffect(() => {
    if (onChange) onChange(files);
  }, [files]);

  return files.length > 0 ? (
    <Row className="attached-files-container" justify="start">
      {files.map((file, index) => {
        return (
          <Col key={index}>
            <PossiblyPendingAttachment
              file={file}
              type={'input'}
              onRemove={() =>
                setFiles(
                  files.filter(
                    f => !_.isEqual(f.metadata?.external_id, file.metadata?.external_id),
                  ),
                )
              }
            />
          </Col>
        );
      })}
    </Row>
  ) : (
    <></>
  );
};
