/**
 * Steps Component for uxcore
 * @author vincent.bian
 *
 * Copyright 2014-2015, Uxcore Team, Alinw.
 * All rights reserved.
 */
import React from 'react';
import ReactDOM from 'react-dom';

class Steps extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      init: false,
      tailWidth: 0,
    };
    this._previousStepsWidth = 0;
    this._itemsWidth = [];
  }

  componentDidMount() {
    if (this.props.direction === 'vertical') {
      return;
    }

    const $dom = ReactDOM.findDOMNode(this);
    const len = $dom.children.length - 1;
    this._itemsWidth = new Array(len + 1);

    let i;
    for (i = 0; i <= len - 1; i++) {
      this._itemsWidth[i] = this.props.maxDescriptionWidth;
    }
    this._itemsWidth[i] = this.props.maxDescriptionWidth;
    this._previousStepsWidth = Math.floor(ReactDOM.findDOMNode(this).offsetWidth);
    this._update();

        /*
         * 把最后一个元素设置为absolute，是为了防止动态添加元素后滚动条出现导致的布局问题。
         * 未来不考虑ie8一类的浏览器后，会采用纯css来避免各种问题。
         */
    $dom.children[len].style.position = 'absolute';

    this.fixLastDetailHeight();

        /*
         * 下面的代码是为了兼容window系统下滚动条出现后会占用宽度的问题。
         * componentDidMount时滚动条还不一定出现了，这时候获取的宽度可能不是最终宽度。
         * 对于滚动条不占用宽度的浏览器，下面的代码也不二次render，_resize里面会判断要不要更新。
         */
    setTimeout(() => {
      this._resize();
    });

    this._resizeBind = this._resize.bind(this);

    if (window.attachEvent) {
      window.attachEvent('onresize', this._resizeBind);
    } else {
      window.addEventListener('resize', this._resizeBind);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.children.length !== this.props.children.length) {
      if (this.props.direction === 'vertical') {
        return;
      }
      const len = nextProps.children.length - 1;
      this._itemsWidth = new Array(len + 1);

      let i;
      for (i = 0; i <= len - 1; i++) {
        this._itemsWidth[i] = nextProps.maxDescriptionWidth;
      }
      this._itemsWidth[i] = nextProps.maxDescriptionWidth;
      this._update(nextProps);
    }
  }

  componentDidUpdate() {
    this._resize();
    const $dom = ReactDOM.findDOMNode(this);

    const len = $dom.children.length - 1;
        /*
         * 把最后一个元素设置为absolute，是为了防止动态添加元素后滚动条出现导致的布局问题。
         * 未来不考虑ie8一类的浏览器后，会采用纯css来避免各种问题。
         */
    for (let i = 0; i <= len; i++) {
      $dom.children[i].style.position = 'relative';
    }
    $dom.children[len].style.position = 'absolute';
    this.fixLastDetailHeight();
  }

  componentWillUnmount() {
    if (this.props.direction === 'vertical') {
      return;
    }
    if (window.attachEvent) {
      window.detachEvent('onresize', this._resizeBind);
    } else {
      window.removeEventListener('resize', this._resizeBind);
    }
  }

  _resize() {
    this.fixLastDetailHeight();
    const w = Math.floor(ReactDOM.findDOMNode(this).offsetWidth);
    if (this._previousStepsWidth === w) {
      return;
    }
    this._previousStepsWidth = w;
    this._update();
  }

  fixLastDetailHeight() {
        /*
         * 把整体高度调整为适合高度,处理最后一个detail是绝对定位的问题
         * */
    const $dom = ReactDOM.findDOMNode(this);
    const len = $dom.children.length - 1;
    const $domLastDetail = $dom.children[len];
    if (this.props.currentDetail === len && $dom.offsetHeight <= $domLastDetail.offsetHeight) {
      $dom.style.height = `${$domLastDetail.offsetHeight}px`;
    } else {
      $dom.style.height = 'auto';
    }
  }

  _update(props = this.props) {
    const len = props.children.length - 1;
    const tw = this._itemsWidth.reduce((prev, w) =>
            prev + w
            , 0);
    const dw = Math.floor((this._previousStepsWidth - tw) / len) - 1;
    if (dw <= 0) {
      return;
    }
    this.setState({
      init: true,
      tailWidth: dw,
    });
  }

  render() {
    let { current } = this.props;
    const {
            prefixCls,
            className,
            children,
            maxDescriptionWidth,
            iconPrefix,
            direction,
            showIcon,
            type,
            showDetail,
            currentDetail,
            onChange,
        } = this.props;
    const len = children.length - 1;
    const iws = this._itemsWidth;
    let clsName = prefixCls;
    let fixStyle;
    if (direction === 'vertical') {
      clsName += ` ${prefixCls}-vertical ${className}`;
    } else {
      clsName += ` ${prefixCls}-type-${type} ${className}`;
            // fix #5
      if (type === 'default') {
        const descItemsCount = children.filter(d => d.props.description).length;
        if (descItemsCount > 0 && descItemsCount !== len + 1) {
          fixStyle = {
            marginTop: 70,
          };
        }
      }
    }
    if (!showIcon) {
      clsName += ` ${prefixCls}-noicon`;
    }
    if (typeof current !== 'number') {
      current = Number(current);
    }

    return (
      <div className={clsName}>
        {React.Children.map(children, (ele, idx) => {
          const np = {
            stepNumber: showIcon ? (idx + 1).toString() : '',
            stepLast: idx === len,
            tailWidth: iws.length === 0 || idx === len ? 'auto' : iws[idx] + this.state.tailWidth,
            prefixCls,
            iconPrefix,
            maxDescriptionWidth,
            fixStyle,
            showDetail: showDetail && currentDetail === idx && direction !== 'vertical' && type !== 'long-desc',
            detailContentFixStyle: {
              marginLeft: !isNaN(-(iws[idx] + this.state.tailWidth) * idx) ? -(iws[idx] + this.state.tailWidth) * idx : 0,
              width: this._previousStepsWidth,
            },
            onChange,
            hasDetail: showDetail && direction !== 'vertical' && type !== 'long-desc',
          };
          if (!ele.props.status) {
            np.status = idx === current ? 'process' : idx < current ? 'finish' : 'wait';
          }
          return React.cloneElement(ele, np);
        }, this)}
      </div>
    );
  }
}

Steps.defaultProps = {
  prefixCls: 'kuma-step',
  className: '',
  iconPrefix: '',
  maxDescriptionWidth: 100,
  current: 0,
  direction: '',
  showIcon: true,
  type: 'default',
  showDetail: false,
  currentDetail: 0,
  onChange: () => {
  },
};

// http://facebook.github.io/react/docs/reusable-components.html
Steps.propTypes = {
  prefixCls: React.PropTypes.string,
  className: React.PropTypes.string,
  iconPrefix: React.PropTypes.string,
  maxDescriptionWidth: React.PropTypes.number,
  current: React.PropTypes.number,
  direction: React.PropTypes.string,
  showIcon: React.PropTypes.bool,
  type: React.PropTypes.oneOf(['default', 'title-on-top', 'long-desc']),
  showDetail: React.PropTypes.bool,
  currentDetail: React.PropTypes.number,
  onChange: React.PropTypes.func,
};

Steps.displayName = 'Steps';

export default Steps;
