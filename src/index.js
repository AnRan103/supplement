import anCalendar from './components/calendar';
import anDynamicSelect from './components/dynamic-select';
import anTextInput from './components/text-input';

module.exports = {
  install(Vue) {
    Vue.component('an-calendar', anCalendar);
    Vue.component('an-dynamic-select', anDynamicSelect);
    Vue.component('an-text-input', anTextInput);
  },
  anCalendar,
  anDynamicSelect,
  anTextInput,
};

module.exports.default = module.exports;
