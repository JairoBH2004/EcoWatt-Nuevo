/**
 * @format
 */

// 👇 ESTA LÍNEA ES OBLIGATORIA AL PRINCIPIO PARA EVITAR LA PANTALLA BLANCA 👇
import 'react-native-gesture-handler'; 

import {AppRegistry} from 'react-native';
import App from './src/App'; 
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);