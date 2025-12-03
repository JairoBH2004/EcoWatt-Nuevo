package com.ecowattnuevo

import android.os.Bundle // <--- 1. IMPORTACIÓN NUEVA OBLIGATORIA
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "EcowattNuevo"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

  // 🔥 2. ESTE BLOQUE ES EL QUE ARREGLA LA PANTALLA BLANCA 🔥
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(null)
  }
}