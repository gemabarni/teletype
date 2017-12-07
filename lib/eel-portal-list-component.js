const etch = require('etch')
const $ = etch.dom
const EelHostPortalBindingComponent = require('./eel-host-portal-binding-component')
const EelGuestPortalBindingComponent = require('./eel-guest-portal-binding-component')
const EelJoinPortalComponent = require('./eel-join-portal-component')

module.exports =
class PortalListComponent {
  constructor (props) {
    this.props = props
    this.props.initializing = true
    etch.initialize(this)

    // this.subscriptions = this.props.portalBindingManager.onDidChange(async () => {
    //   await this.fetchModel()
    //   etch.update(this)
    // })

    let resolveInitializationPromise
    this.initializationPromise = new Promise((resolve) => {
      resolveInitializationPromise = resolve
    })
    this.fetchModel().then(async () => {
      this.props.initializing = false
      await etch.update(this)
      resolveInitializationPromise()
    })
  }

  destroy () {
    this.subscriptions.dispose()
    return etch.destroy(this)
  }

  async fetchModel () {
    const {portalBindingManager} = this.props
    // this.props.hostPortalBinding = await portalBindingManager.getHostPortalBinding()
    // this.props.guestPortalBindings = await portalBindingManager.getGuestPortalBindings()
  }

  async update (props) {
    Object.assign(this.props, props)
    await this.fetchModel()
    return etch.update(this)
  }

  render () {
    if (this.props.initializing) {
      return $.div({className: 'PortalListComponent--initializing', ref: 'initializationSpinner'},
        $.span({className: 'loading loading-spinner-tiny inline-block'})
      )
    } else {
      return $.div({className: 'PortalListComponent'},
        this.renderHostPortalBindingComponent(),
        this.renderGuestPortalBindingComponents(),
        this.renderJoinPortalComponent()
      )
    }
  }

  renderHostPortalBindingComponent () {
    return $(EelHostPortalBindingComponent, {
      ref: 'eelHostPortalBindingComponent',
      clipboard: this.props.clipboard,
      localUserIdentity: this.props.localUserIdentity,
      portalBindingManager: this.props.portalBindingManager,
      portalBinding: this.props.hostPortalBinding
    })
  }

  renderGuestPortalBindingComponents () {
    // const portalBindingComponents = this.props.guestPortalBindings.map((portalBinding) => (
    //   $(EelGuestPortalBindingComponent, {portalBinding})
    // ))

    return $.div(
      {
        ref: 'eelGuestPortalBindingsContainer',
        className: 'PortalListComponent-GuestPortalsContainer'
      }
      // portalBindingComponents
    )
  }

  renderJoinPortalComponent () {
    return $(EelJoinPortalComponent, {
      ref: 'eelJoinPortalComponent',
      portalBindingManager: this.props.portalBindingManager,
      commandRegistry: this.props.commandRegistry,
      clipboard: this.props.clipboard,
      notificationManager: this.props.notificationManager
    })
  }

  async showJoinPortalPrompt () {
    await this.initializationPromise
    await this.refs.joinPortalComponent.showPrompt()
  }
}
