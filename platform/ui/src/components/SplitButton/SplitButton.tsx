import React, { useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import OutsideClickHandler from 'react-outside-click-handler';
import { useTranslation } from 'react-i18next';

import Icon from '../Icon';
import Tooltip from '../Tooltip';
import ListMenu from '../ListMenu';

const baseClasses = {
  Button: 'flex items-center rounded-md border-transparent group/button',
  Primary: 'h-full rounded-tl-md rounded-bl-md group/primary',
  Secondary:
    'h-full flex items-center justify-center rounded-tr-md rounded-br-md w-4 border-2 border-transparent group/secondary',
  SecondaryIcon: 'w-4 h-full stroke-1 text-white',
  Separator: 'border-l py-3 ml-0.5',
  Content: 'absolute z-10 top-0 mt-12',
};

const classes = {
  Button: ({ isExpanded }) =>
    classNames(
      baseClasses.Button,
      !isExpanded && 'hover:bg-opacity-20'
    ),
  Interface: 'h-full flex flex-row items-center',
  Primary: ({ isExpanded, isActive }) =>
    classNames(
      baseClasses.Primary,
      'text-white bg-transparent hover:bg-opacity-20'
    ),
  Secondary: ({ isExpanded }) =>
    classNames(
      baseClasses.Secondary,
      'text-white bg-transparent hover:bg-opacity-20'
    ),
  SecondaryIcon: ({ isExpanded }) =>
    classNames(
      baseClasses.SecondaryIcon,
      'text-white hover:text-white'
    ),
  Separator: ({ isExpanded, isHovering }) =>
    classNames(
      baseClasses.Separator,
      'border-transparent'
    ),
  Content: ({ isExpanded }) => classNames(baseClasses.Content, isExpanded ? 'block' : 'hidden'),
};

const DefaultListItemRenderer = props => {
  const { t, icon, label, className, isActive } = props;
  return (
    <div
      className={classNames(
        'flex h-8 w-full select-none flex-row items-center p-3',
        'whitespace-pre text-base text-white',
        className,
        'hover:bg-opacity-20'
      )}
    >
      {icon && (
        <span className="mr-4">
          <Icon
            name={icon}
            className="h-[28px] w-[28px] text-white"
          />
        </span>
      )}
      <span className="mr-5">{t?.(label)}</span>
    </div>
  );
};

/**
 * This is a more generic version of SplitButton without the isActive
 * and other interaction props
 */
const SplitButton = ({
                       groupId,
                       primary,
                       secondary,
                       items,
                       renderer = null,
                       onInteraction,
                       Component = Icon,
                     }) => {
  const { t } = useTranslation('Buttons');
  const [state, setState] = useState({ isHovering: false, isExpanded: false });

  const toggleExpanded = () => setState({ ...state, isExpanded: !state.isExpanded });
  const setHover = hovering => setState({ ...state, isHovering: hovering });
  const collapse = () => setState({ ...state, isExpanded: false });

  const listItemRenderer = renderer || DefaultListItemRenderer;
  const primaryClassNames = classNames(
    classes.Primary({
      isExpanded: state.isExpanded,
      isActive: primary.isActive,
    }),
    primary.className
  );
  return (
    <OutsideClickHandler
      onOutsideClick={collapse}
      disabled={!state.isExpanded}
    >
      <div
        id="SplitButton"
        className="relative"
      >
        <div
          className={classes.Button({ ...state })}
          style={{ height: '40px' }}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
        >
          <div className={classes.Interface}>
            <div onClick={collapse}>
              <Component
                key={primary.id}
                {...primary}
                onInteraction={onInteraction}
                rounded="none"
                className={primaryClassNames}
                data-tool={primary.id}
                data-cy={`${groupId}-split-button-primary`}
              />
            </div>
            <div className={classes.Separator({ ...state })}></div>
            <div
              className={classes.Secondary({ ...state })}
              onClick={toggleExpanded}
              data-cy={`${groupId}-split-button-secondary`}
            >
              <Tooltip
                isDisabled={state.isExpanded || !secondary.tooltip}
                content={secondary.tooltip}
                className="h-full"
              >
                <Icon
                  name={secondary.icon}
                  className={classes.SecondaryIcon({ ...state })}
                />
              </Tooltip>
            </div>
          </div>
        </div>
        <div
          className={classes.Content({ ...state })}
          data-cy={`${groupId}-list-menu`}
        >
          <ListMenu
            items={items}
            onClick={collapse}
            renderer={args => listItemRenderer({ ...args, t })}
          />
        </div>
      </div>
    </OutsideClickHandler>
  );
};

SplitButton.propTypes = {
  groupId: PropTypes.string.isRequired,
  primary: PropTypes.object.isRequired,
  secondary: PropTypes.object.isRequired,
  items: PropTypes.array.isRequired,
  renderer: PropTypes.func,
  isActive: PropTypes.bool,
  onInteraction: PropTypes.func.isRequired,
  Component: PropTypes.elementType,
  interactionType: PropTypes.oneOf(['action', 'tool', 'toggle']),
};

export default SplitButton;
