/* jshint esversion:6, -W117 */
'use strict'

const path = require('path')
const cp = require('child_process')
const remote = require('electron').remote
const app = remote.app
const dialog = remote.dialog
const isDev = require('electron-is-dev')
const adb = path.resolve((isDev ? path.resolve(`${__dirname}`, '../../') : path.dirname(process.execPath)), 'resources/adb/adb.exe')
const apk = path.resolve((isDev ? path.resolve(`${__dirname}`, '../../') : path.dirname(process.execPath)), 'castscreenApp/castscreen-1.0.1.apk')

// Install CastScreen App
module.exports = function csInstaller () {
  snackbar('Detecting Device Connection... ')
  var deviceConnected = false
  var command = cp.spawn(adb, ['devices', '-l'], { detached: true })
  command.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`)
    if (data.includes('model')) {
      deviceConnected = true
    }
  })

  command.stderr.on('data', (data) => {
    console.log(`stderr: ${data}`)
  })
  command.on('close', function (code) {
    console.log(`exit code: ${code}`)
    if (typeof done === 'function') {
      done(code)
    }
    if (code === 0 && deviceConnected) {
      installAPK()
    } else {
      dialog.showErrorBox(`ERROR: Device not found`, `Connect phone to PC via USB and enable adb debugging in developer options.`)
    }
  })
  command.on('error', (err) => {
    dialog.showErrorBox('Failed to start subprocess.', err)
  })
}

function installAPK () {
  snackbar(`Device Found, Installing Castscreen App...`)
  var command = cp.spawn(adb, ['install', apk], { detached: true })
  command.stdout.on('data', (data) => {
    // console.log(`stdout: ${data}`)
    if (data.indexOf('error:') > 0) {
      // dialog.showErrorBox(`ERROR: CONNECT PHONE TO USB AND ENABLE ADB DEBUGGING`, `${data}`)
    }
  })
  command.stderr.on('data', (data) => {
    console.log(`stderr: ${data}`)
  })
  command.on('close', function (code) {
    console.log(`exit code: ${code}`)
    if (code === 0) {
      snackbar(`Castscreen App Installed...`)
    } else {
      console.log(code)
      dialog.showErrorBox(`ERROR: APK FILE NOT FOUND`, `apk file: ${apk} was not found`)
    }
  })
  command.on('error', (err) => {
    console.log('Failed to start subprocess.')
  })
}
