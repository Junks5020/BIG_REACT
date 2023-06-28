import reactDomConifg from './react-dom.config';
import reactConfig from './react.config';

export default () => {
  return [...reactDomConifg, ...reactConfig];
};
