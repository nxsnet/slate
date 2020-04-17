/**
 * Mix in an `Interface` to a `Class`.
 *
 * @param {Class} Interface
 * @param {Class} Class
 */

export default function mixin(Interface, Classes) {
  for (const Class of Classes) {
    // Copy static properties from the interface.
    for (const name of Object.getOwnPropertyNames(Interface)) {
      if (Class.hasOwnProperty(name)) continue
      const desc = Object.getOwnPropertyDescriptor(Interface, name)

      try {
        if (desc == null) {
          console.log(`Property descriptor was undefined for: ${name}`)
          Class[name] = Class[name]
        } else {
          Object.defineProperty(Class, name, desc)
        }
      } catch (e) {
        /* ignored */
      }
    }

    // Copy instance properties from the interface.
    for (const name of Object.getOwnPropertyNames(Interface.prototype)) {
      if (Class.prototype.hasOwnProperty(name)) continue
      const desc = Object.getOwnPropertyDescriptor(Interface.prototype, name)

      try {
        if (desc == null) {
          console.log(
            `Property prototype descriptor was undefined for: ${name}`
          )

          Class.prototype[name] = Interface.prototype[name]
        } else {
          Object.defineProperty(Class.prototype, name, desc)
        }
      } catch (e) {
        /* ignored */
      }
    }
  }
}
