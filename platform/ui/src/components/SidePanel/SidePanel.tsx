import classnames from 'classnames';
import PropTypes from 'prop-types';
import React, { CSSProperties, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Icon from '../Icon';
import Tooltip from '../Tooltip';

const borderSize = 4;
const collapsedWidth = 25;
const closeIconWidth = 30;
const gridHorizontalPadding = 10;
const tabSpacerWidth = 2;

const baseClasses =
  'transition-all duration-300 ease-in-out justify-start box-content flex flex-col';

const classesMap = {
  open: {
    left: `mr-1`,
    right: `ml-1`,
  },
  closed: {
    left: `mr-2 items-end`,
    right: `ml-2 items-start`,
  },
};

const openStateIconName = {
  left: 'side-panel-close-left',
  right: 'side-panel-close-right',
};

const getTabWidth = (numTabs) => {
  if (numTabs < 3) {
    return 68;
  } else {
    return 40;
  }
};

const getGridWidth = (numTabs, gridAvailableWidth) => {
  const spacersWidth = (numTabs - 1) * tabSpacerWidth;
  const tabsWidth = getTabWidth(numTabs) * numTabs;

  if (gridAvailableWidth > tabsWidth + spacersWidth) {
    return tabsWidth + spacersWidth;
  }

  return gridAvailableWidth;
};

const getNumGridColumns = (numTabs, gridWidth) => {
  if (numTabs === 1) {
    return 1;
  }

  const tabWidth = getTabWidth(numTabs);
  const numTabsWithOneSpacerEach = Math.floor(gridWidth / (tabWidth + tabSpacerWidth));

  if (
    (numTabsWithOneSpacerEach + 1) * tabWidth + numTabsWithOneSpacerEach * tabSpacerWidth <=
    gridWidth
  ) {
    return numTabsWithOneSpacerEach + 1;
  }

  return numTabsWithOneSpacerEach;
};

const getGridStyle = (side, numTabs = 0, gridWidth, expandedWidth) => {
  const relativePosition = Math.max(0, Math.floor(expandedWidth - gridWidth) / 2 - closeIconWidth);
  return {
    position: 'relative',
    ...(side === 'left' ? { right: `${relativePosition}px` } : { left: `${relativePosition}px` }),
    width: `${gridWidth}px`,
  };
};

const getTabClassNames = (numColumns, numTabs, tabIndex, isActiveTab, isTabDisabled) =>
  classnames('h-[28px] mb-[2px] cursor-pointer', {
    'text-black bg-white': !isActiveTab && !isTabDisabled,
    'hover:text-black': !isActiveTab && !isTabDisabled,
    'rounded-l': tabIndex % numColumns === 0,
    'rounded-r': (tabIndex + 1) % numColumns === 0 || tabIndex === numTabs - 1,
    'text-primary-active': isActiveTab,
  });

const getTabStyle = (numTabs) => {
  return {
    width: `${getTabWidth(numTabs)}px`,
  };
};

const getTabIconClassNames = (numTabs, isActiveTab) => {
  return classnames('h-full w-full flex items-center justify-center', {
    'bg-gray-200': isActiveTab,
    rounded: isActiveTab,
  });
};

const createStyleMap = (expandedWidth, borderSize, collapsedWidth) => {
  const collapsedHideWidth = expandedWidth - collapsedWidth - borderSize;

  return {
    open: {
      left: { marginLeft: '0px' },
      right: { marginRight: '0px' },
    },
    closed: {
      left: { marginLeft: `-${collapsedHideWidth}px` },
      right: { marginRight: `-${collapsedHideWidth}px` },
    },
  };
};

const getToolTipContent = (label, disabled) => {
  return (
    <>
      <div>{label}</div>
      {disabled && <div className="text-black">{'Not available based on current context'}</div>}
    </>
  );
};

const createBaseStyle = (expandedWidth) => {
  return {
    maxWidth: `${expandedWidth}px`,
    width: `${expandedWidth}px`,
    position: 'relative',
    top: '0.2%',
    height: '99.8%',
  };
};

const SidePanel = ({
                     side,
                     className,
                     activeTabIndex: activeTabIndexProp = null,
                     tabs,
                     onOpen,
                     expandedWidth = 248,
                     onActiveTabIndexChange,
                   }) => {
  const { t } = useTranslation('SidePanel');

  const [panelOpen, setPanelOpen] = useState(activeTabIndexProp !== null);
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  const styleMap = createStyleMap(expandedWidth, borderSize, collapsedWidth);
  const baseStyle = createBaseStyle(expandedWidth);
  const gridAvailableWidth = expandedWidth - closeIconWidth - gridHorizontalPadding;
  const gridWidth = getGridWidth(tabs.length, gridAvailableWidth);
  const openStatus = panelOpen ? 'open' : 'closed';
  const style = Object.assign({}, styleMap[openStatus][side], baseStyle);

  const updatePanelOpen = useCallback(
    (panelOpen) => {
      setPanelOpen(panelOpen);
      if (panelOpen && onOpen) {
        onOpen();
      }
    },
    [onOpen]
  );

  const updateActiveTabIndex = useCallback(
    (activeTabIndex) => {
      if (activeTabIndex === null) {
        updatePanelOpen(false);
        return;
      }

      setActiveTabIndex(activeTabIndex);
      updatePanelOpen(true);

      if (onActiveTabIndexChange) {
        onActiveTabIndexChange({ activeTabIndex });
      }
    },
    [onActiveTabIndexChange, updatePanelOpen]
  );

  useEffect(() => {
    updateActiveTabIndex(activeTabIndexProp);
  }, [activeTabIndexProp, updateActiveTabIndex]);

  const getCloseStateComponent = () => {
    const _childComponents = Array.isArray(tabs) ? tabs : [tabs];
    return (
      <>
        <div
          className={classnames(
            'flex h-[28px] w-full cursor-pointer items-center rounded-md',
            side === 'left' ? 'justify-end pr-2 bg-gray-200' : 'justify-start pl-2 bg-black'
          )}
          onClick={() => {
            updatePanelOpen(!panelOpen);
          }}
          data-cy={`side-panel-header-${side}`}
        >
          <Icon
            name={'navigation-panel-right-reveal'}
            className={classnames(side === 'left' ? 'text-black' : 'text-primary-active', side === 'left' && 'rotate-180 transform')}
          />
        </div>
        <div className={classnames('mt-3 flex flex-col space-y-3')}>
          {_childComponents.map((childComponent, index) => (
            <Tooltip
              position={side === 'left' ? 'right' : 'left'}
              key={index}
              content={getToolTipContent(childComponent.label, childComponent.disabled)}
              className={classnames(
                'flex items-center',
                side === 'left' ? 'justify-end ' : 'justify-start '
              )}
            >
              <div
                id={`${childComponent.name}-btn`}
                data-cy={`${childComponent.name}-btn`}
                className={side === 'left' ? 'text-black hover:cursor-pointer' : 'text-primary-active hover:cursor-pointer'}
                onClick={() => {
                  return childComponent.disabled ? null : updateActiveTabIndex(index);
                }}
              >
                <Icon
                  name={childComponent.iconName}
                  className={classnames({
                    'text-black': side === 'left',
                    'text-primary-active': side === 'right',
                    'ohif-disabled': childComponent.disabled,
                  })}
                  style={{
                    width: '22px',
                    height: '22px',
                  }}
                />
              </div>
            </Tooltip>
          ))}
        </div>
      </>
    );
  };

  const getCloseIcon = () => {
    return (
      <div
        className={classnames(
          'flex h-[28px] cursor-pointer items-center justify-center',
          side === 'left' ? 'order-last' : 'order-first'
        )}
        style={{ width: `${closeIconWidth}px` }}
        onClick={() => {
          updatePanelOpen(!panelOpen);
        }}
        data-cy={`side-panel-header-${side}`}
      >
        <Icon
          name={openStateIconName[side]}
          className={side === 'left' ? 'text-black' : 'text-primary-active'}
        />
      </div>
    );
  };

  const getTabGridComponent = () => {
    const numCols = getNumGridColumns(tabs.length, gridWidth);

    return (
      <div className={classnames('flex grow ', side === 'right' ? 'justify-start' : 'justify-end')}>
        <div
          className={classnames('flex flex-wrap', side === 'left' ? 'bg-gray-200 text-black' : 'bg-black text-primary-active')}
          style={getGridStyle(side, tabs.length, gridWidth, expandedWidth)}
        >
          {tabs.map((tab, tabIndex) => {
            const { disabled } = tab;
            return (
              <React.Fragment key={tabIndex}>
                {tabIndex % numCols !== 0 && (
                  <div
                    className={classnames(
                      'flex h-[28px] w-[2px] items-center',
                      side === 'left' ? 'bg-white' : 'bg-black'
                    )}
                  >
                    <div className={side === 'left' ? 'bg-gray-200 h-[20px] w-full' : 'bg-black h-[20px] w-full'}></div>
                  </div>
                )}
                <Tooltip
                  position={'bottom'}
                  key={tabIndex}
                  content={getToolTipContent(tab.label, disabled)}
                >
                  <div
                    className={getTabClassNames(
                      numCols,
                      tabs.length,
                      tabIndex,
                      tabIndex === activeTabIndex,
                      disabled
                    )}
                    style={getTabStyle(tabs.length)}
                    onClick={() => {
                      return disabled ? null : updateActiveTabIndex(tabIndex);
                    }}
                    data-cy={`${tab.name}-btn`}
                  >
                    <div className={getTabIconClassNames(tabs.length, tabIndex === activeTabIndex)}>
                      <Icon
                        name={tab.iconName}
                        className={`${tab.disabled && 'ohif-disabled'}`}
                        style={{
                          width: '22px',
                          height: '22px',
                        }}
                      ></Icon>
                    </div>
                  </div>
                </Tooltip>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  };

  const getOneTabComponent = () => {
    return (
      <div
        className={classnames(
          'flex grow cursor-pointer select-none justify-center self-center text-[13px]',
          side === 'left' ? 'text-black' : 'text-primary-active'
        )}
        style={{
          ...(side === 'left'
            ? { marginLeft: `${closeIconWidth}px` }
            : { marginRight: `${closeIconWidth}px` }),
        }}
        data-cy={`${tabs[0].name}-btn`}
        onClick={() => updatePanelOpen(!panelOpen)}
      >
        <span>{tabs[0].label}</span>
      </div>
    );
  };

  const getOpenStateComponent = () => {
    return (
      <div className={side === 'left' ? 'bg-gray-200 flex select-none rounded-t pt-1.5 pb-[2px]' : 'bg-black flex select-none rounded-t pt-1.5 pb-[2px]'}>
        {getCloseIcon()}
        {tabs.length === 1 ? getOneTabComponent() : getTabGridComponent()}
      </div>
    );
  };

  return (
    <div
      className={classnames(className, baseClasses, classesMap[openStatus][side], side === 'left' ? 'bg-white border-gray-300' : 'bg-black border-black')}
      style={style}
    >
      {panelOpen ? (
        <>
          {getOpenStateComponent()}
          {tabs.map((tab, tabIndex) => {
            if (tabIndex === activeTabIndex) {
              return <tab.content key={tabIndex} />;
            }
            return null;
          })}
        </>
      ) : (
        <React.Fragment>{getCloseStateComponent()}</React.Fragment>
      )}
    </div>
  );
};

SidePanel.propTypes = {
  side: PropTypes.oneOf(['left', 'right']).isRequired,
  className: PropTypes.string,
  activeTabIndex: PropTypes.number,
  tabs: PropTypes.oneOfType([
    PropTypes.arrayOf(
      PropTypes.shape({
        iconName: PropTypes.string.isRequired,
        iconLabel: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        content: PropTypes.func,
      })
    ),
  ]),
  onOpen: PropTypes.func,
  onActiveTabIndexChange: PropTypes.func,
  expandedWidth: PropTypes.number,
};

export default SidePanel;
