import classnames from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import SwiperCore, { A11y, Controller, Navigation, Pagination, Scrollbar } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';

import { Types } from '@ohif/core';

import LegacyButton from '../LegacyButton';
import Icon from '../Icon';
import IconButton from '../IconButton';
import Tooltip from '../Tooltip';

import 'swiper/css';
import 'swiper/css/navigation';
import './style.css';

const borderSize = 4;
const expandedWidth = 248;
const collapsedWidth = 25;

const baseStyle = {
  maxWidth: `${expandedWidth}px`,
  width: `${expandedWidth}px`,
};

const collapsedHideWidth = expandedWidth - collapsedWidth - borderSize;
const styleMap = {
  open: {
    left: { marginLeft: '0px' },
    right: { marginRight: '0px' },
  },
  closed: {
    left: { marginLeft: `-${collapsedHideWidth}px` },
    right: { marginRight: `-${collapsedHideWidth}px` },
  },
};

const baseClasses =
  'transition-all duration-300 ease-in-out h-100 bg-white border-black justify-start box-content flex flex-col';

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
  left: 'push-left',
  right: 'push-right',
};

const position = {
  left: {
    right: 5,
  },
  right: {
    left: 5,
  },
};

const LegacySidePanel = ({
                           servicesManager,
                           side,
                           className,
                           activeTabIndex: activeTabIndexProp,
                           tabs,
                         }) => {
  const panelService = servicesManager?.services?.panelService;

  const { t } = useTranslation('LegacySidePanel');

  const [hasBeenOpened, setHasBeenOpened] = useState(activeTabIndexProp !== null);
  const [panelOpen, setPanelOpen] = useState(activeTabIndexProp !== null);
  const [activeTabIndex, setActiveTabIndex] = useState(activeTabIndexProp ?? 0);
  const swiperRef = useRef() as any;
  const [swiper, setSwiper] = useState<any>();

  const prevRef = React.useRef();
  const nextRef = React.useRef();

  const openStatus = panelOpen ? 'open' : 'closed';
  const style = Object.assign({}, styleMap[openStatus][side], baseStyle);

  const ActiveComponent = tabs[activeTabIndex].content;

  useEffect(() => {
    if (panelOpen && swiper) {
      swiper.slideTo(activeTabIndex, 500);
    }
  }, [panelOpen, swiper]);

  useEffect(() => {
    if (swiper) {
      swiper.params.navigation.prevEl = prevRef.current;
      swiper.params.navigation.nextEl = nextRef.current;
      swiper.navigation.init();
      swiper.navigation.update();
    }
  }, [swiper]);

  const updatePanelOpen = useCallback((panelOpen: boolean) => {
    setPanelOpen(panelOpen);
    if (panelOpen) {
      setHasBeenOpened(true);
    }
  }, []);

  const updateActiveTabIndex = useCallback(
    (activeTabIndex: number) => {
      setActiveTabIndex(activeTabIndex);
      updatePanelOpen(true);
    },
    [updatePanelOpen]
  );

  useEffect(() => {
    if (panelService) {
      const activatePanelSubscription = panelService.subscribe(
        panelService.EVENTS.ACTIVATE_PANEL,
        (activatePanelEvent: Types.ActivatePanelEvent) => {
          if (!hasBeenOpened || activatePanelEvent.forceActive) {
            const tabIndex = tabs.findIndex(tab => tab.id === activatePanelEvent.panelId);
            if (tabIndex !== -1) {
              updateActiveTabIndex(tabIndex);
            }
          }
        }
      );

      return () => {
        activatePanelSubscription.unsubscribe();
      };
    }
  }, [tabs, hasBeenOpened, panelService, updateActiveTabIndex]);

  const getCloseStateComponent = () => {
    const _childComponents = Array.isArray(tabs) ? tabs : [tabs];
    return (
      <>
        <div
          className={classnames(
            'bg-white flex h-[28px] w-full cursor-pointer items-center rounded-md',
            side === 'left' ? 'justify-end pr-2' : 'justify-start pl-2'
          )}
          onClick={() => {
            updatePanelOpen(prev => !prev);
          }}
          data-cy={`side-panel-header-${side}`}
        >
          <Icon
            name={'navigation-panel-right-reveal'}
            className={classnames('text-black', side === 'left' && 'rotate-180 transform')}
          />
        </div>
        <div className={classnames('mt-3 flex flex-col space-y-3')}>
          {_childComponents.map((childComponent, index) => (
            <Tooltip
              position={side === 'left' ? 'right' : 'left'}
              key={index}
              content={`${childComponent.label}`}
              className={classnames(
                'flex items-center',
                side === 'left' ? 'justify-end ' : 'justify-start '
              )}
            >
              <IconButton
                id={`${childComponent.name}-btn`}
                variant="text"
                color="inherit"
                size="initial"
                className="text-black"
                onClick={() => {
                  updateActiveTabIndex(index);
                }}
              >
                <Icon
                  name={childComponent.iconName}
                  className="text-black"
                  style={{
                    width: '22px',
                    height: '22px',
                  }}
                />
              </IconButton>
            </Tooltip>
          ))}
        </div>
      </>
    );
  };

  return (
    <div
      className={classnames(className, baseClasses, classesMap[openStatus][side])}
      style={style}
    >
      {panelOpen ? (
        <React.Fragment>
          <div
            className={classnames(
              'flex-static bg-white flex h-9 cursor-pointer px-[10px]',
              tabs.length === 1 && 'mb-1'
            )}
            onClick={() => {
              updatePanelOpen(prev => !prev);
            }}
            data-cy={`side-panel-header-${side}`}
          >
            <LegacyButton
              variant="text"
              color="inherit"
              border="none"
              rounded="none"
              className="flex-static relative flex w-full flex-row items-center px-3"
              name={tabs.length === 1 ? `${tabs[activeTabIndex].name}` : ''}
            >
              <Icon
                name={openStateIconName[side]}
                className={classnames(
                  'text-black absolute',
                  side === 'left' && 'order-last'
                )}
                style={{ ...position[side] }}
              />
              <span className="text-black">
                {tabs.length === 1 && (t(tabs[activeTabIndex].label) as string)}
              </span>
            </LegacyButton>
          </div>
          {tabs.length > 1 &&
            _getMoreThanOneTabLayout(
              swiperRef,
              setSwiper,
              prevRef,
              nextRef,
              tabs,
              activeTabIndex,
              updateActiveTabIndex
            )}
          {tabs.length > 3 && (
            <div className="text-black bg-white flex w-full justify-end gap-2 py-1 px-2">
              <button
                ref={prevRef}
                className="swiper-button-prev-custom"
              >
                <Icon
                  name={'icon-prev'}
                  className="text-black"
                />
              </button>
              <button
                ref={nextRef}
                className="swiper-button-next-custom"
              >
                <Icon
                  name={'icon-next'}
                  className="text-black"
                />
              </button>
            </div>
          )}
          <ActiveComponent />
        </React.Fragment>
      ) : (
        <React.Fragment>{getCloseStateComponent()}</React.Fragment>
      )}
    </div>
  );
};

LegacySidePanel.propTypes = {
  servicesManager: PropTypes.object.isRequired,
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
};

function _getMoreThanOneTabLayout(
  swiperRef: any,
  setSwiper: React.Dispatch<any>,
  prevRef: React.MutableRefObject<undefined>,
  nextRef: React.MutableRefObject<undefined>,
  tabs: any,
  activeTabIndex: any,
  updateActiveTabIndex
) {
  return (
    <div
      className="flex-static collapse-sidebar relative bg-white"
    >
      <div className="w-full">
        <Swiper
          onInit={(core: SwiperCore) => {
            swiperRef.current = core.el;
          }}
          simulateTouch={false}
          modules={[Navigation, Pagination, Scrollbar, A11y, Controller]}
          slidesPerView={3}
          spaceBetween={5}
          onSwiper={swiper => setSwiper(swiper)}
          navigation={{
            prevEl: prevRef?.current,
            nextEl: nextRef?.current,
          }}
        >
          {tabs.map((obj, index) => (
            <SwiperSlide key={index}>
              <div
                className={classnames(
                  'flex cursor-pointer flex-col items-center justify-center rounded-[4px] px-4 py-1 text-center hover:text-black',
                  index === activeTabIndex ? 'bg-black text-white' : 'text-black'
                )}
                key={index}
                onClick={() => {
                  updateActiveTabIndex(index);
                }}
                data-cy={`${obj.name}-btn`}
              >
                <span>
                  <Icon
                    name={obj.iconName}
                    className="text-black"
                    style={{
                      width: '22px',
                      height: '22px',
                    }}
                  />
                </span>
                <span className="mt-[5px] select-none whitespace-nowrap text-[10px] font-medium">
                  {obj.label}
                </span>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}

export default LegacySidePanel;
