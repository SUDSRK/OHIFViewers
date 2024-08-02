import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { useTranslation } from 'react-i18next';

import Icon from '../Icon';

const baseClasses = 'first:border-0 border-t border-gray-300 cursor-pointer select-none outline-none';

const StudyItem = ({
                     date,
                     description,
                     numInstances,
                     modalities,
                     trackedSeries,
                     isActive,
                     onClick,
                   }) => {
  const { t } = useTranslation('StudyItem');
  return (
    <div
      className={classnames(
        isActive ? 'bg-gray-200' : 'hover:bg-gray-100 bg-white',
        baseClasses
      )}
      onClick={onClick}
      onKeyDown={onClick}
      role="button"
      tabIndex="0"
    >
      <div className="flex flex-1 flex-col px-4 pb-2">
        <div className="flex flex-row items-center justify-between pt-2 pb-2">
          <div className="text-base text-black">{date}</div>
          <div className="flex flex-row items-center text-base text-black">
            <Icon
              name="group-layers"
              className="mx-2 w-4 text-black"
            />
            {numInstances}
          </div>
        </div>
        <div className="flex flex-row items-center py-1">
          <div className="text-l flex items-center pr-5 text-black">{modalities}</div>
          <div className="flex items-center break-words text-base text-black">{description}</div>
        </div>
      </div>
      {!!trackedSeries && (
        <div className="flex-2 flex">
          <div
            className={classnames(
              'bg-gray-100 mt-2 flex flex-row py-1 pl-2 pr-4 text-base text-black',
              isActive
                ? 'border-gray-300 flex-1 justify-center border-t'
                : 'mx-4 mb-4 rounded-sm'
            )}
          >
            <Icon
              name="tracked"
              className="text-black mr-2 w-4"
            />
            {t('Tracked series', { trackedSeries: trackedSeries })}
          </div>
        </div>
      )}
    </div>
  );
};

StudyItem.propTypes = {
  date: PropTypes.string.isRequired,
  description: PropTypes.string,
  modalities: PropTypes.string.isRequired,
  numInstances: PropTypes.number.isRequired,
  trackedSeries: PropTypes.number,
  isActive: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
};

export default StudyItem;
