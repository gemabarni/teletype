const {CompositeDisposable} = require('atom')
const EelPopoverComponent = require('./eel-popover-component')

module.exports =
class EelStatusBarIndicator {
  constructor (props) {
    this.props = props
    this.subscriptions = new CompositeDisposable()
    this.element = buildElement(props)
    this.popoverComponent = new EelPopoverComponent(props)

    // if (props.portalBindingManager) {
    //   this.portalBindingManager = props.portalBindingManager
    //   this.subscriptions.add(this.portalBindingManager.onDidChange(() => {
    //     this.updatePortalStatus()
    //   }))
    // }
  }

  attach () {
    const PRIORITY_BETWEEN_BRANCH_NAME_AND_GRAMMAR = -30
    this.tile = this.props.statusBar.addRightTile({
      item: this,
      priority: PRIORITY_BETWEEN_BRANCH_NAME_AND_GRAMMAR
    })
    this.tooltip = this.props.tooltipManager.add(
      this.element,
      {
        item: this.popoverComponent,
        class: 'TeletypePopoverTooltip',
        trigger: 'click',
        placement: 'top'
      }
    )
  }

  destroy () {
    if (this.tile) this.tile.destroy()
    if (this.tooltip) this.tooltip.dispose()
    this.subscriptions.dispose()
  }

  showPopover () {
    if (!this.isPopoverVisible()) this.element.click()
  }

  hidePopover () {
    if (this.isPopoverVisible()) this.element.click()
  }

  isPopoverVisible () {
    return document.contains(this.popoverComponent.element)
  }

  async updatePortalStatus () {
    // const transmitting = await this.portalBindingManager.hasActivePortals()
    // if (transmitting) {
    //   this.element.classList.add('transmitting')
    // } else {
    //   this.element.classList.remove('transmitting')
    // }
  }
}

function buildElement (props) {
  const anchor = document.createElement('a')
  anchor.classList.add('EelStatusBarIndicator', 'inline-block')

  const icon = document.createElement('span')
  icon.classList.add('icon', 'icon-flame')
  anchor.appendChild(icon)

  return anchor
}
