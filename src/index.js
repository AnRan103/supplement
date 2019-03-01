import calendar from './components/calendar';
import dynamicSelect from './components/dynamic-select';
import textInput from './components/text-input';

export default {
  install(Vue) {
    Vue.component('an-calendar', calendar);
    Vue.component('dynamic-select', dynamicSelect);
    Vue.component('text-input', textInput);
  },
};
