const etch = require('etch')
const $ = etch.dom
const EelPortalListComponent = require('./eel-portal-list-component')
const PackageInitializationErrorComponent = require('./package-initialization-error-component')

module.exports =
class PopoverComponent {
  constructor (props) {
    this.props = props
    if (this.props.authenticationProvider) {
      this.props.authenticationProvider.onDidChange(() => { this.update() })
    }
    etch.initialize(this)
  }

  update () {
    return etch.update(this)
  }

  render () {
    const {
      isClientOutdated, initializationError,
      authenticationProvider, portalBindingManager,
      commandRegistry, clipboard, workspace, notificationManager
    } = this.props

    let activeComponent
    if (initializationError) {
      activeComponent = $(PackageInitializationErrorComponent, {
        ref: 'packageInitializationErrorComponent'
      })
    } else {
      activeComponent = $(EelPortalListComponent, {
        ref: 'eelPortalListComponent',
        localUserIdentity: authenticationProvider.getIdentity(),
        portalBindingManager,
        clipboard,
        commandRegistry,
        notificationManager
      })
    }

    return $.div({className: 'PopoverComponent'}, activeComponent)
  }
}
