import hljs from 'highlight.js/lib/core'
import cpp from 'highlight.js/lib/languages/cpp'
import python from 'highlight.js/lib/languages/python'
import java from 'highlight.js/lib/languages/java'
import 'highlight.js/styles/atom-one-light.css'

hljs.registerLanguage('cpp', cpp)
hljs.registerLanguage('java', java)
hljs.registerLanguage('python', python)

export default {
  install (app, options) {
    app.directive('highlight', {
      mounted: function (el, binding) {
        // on first bind, highlight all targets
        Array.from(el.querySelectorAll('code')).forEach((target) => {
          // if a value is directly assigned to the directive, use this
          // instead of the element content.
          if (binding.value) {
            target.textContent = binding.value
          }
          hljs.highlightElement(target)
        })
      },
      updated: function (el, binding) {
        // after an update, re-fill the content and then highlight
        Array.from(el.querySelectorAll('code')).forEach((target) => {
          if (binding.value) {
            target.textContent = binding.value
          }
          hljs.highlightElement(target)
        })
      }
    })
  }
}
