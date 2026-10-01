# Planter

A mobile app for recognizing wild plants from a photo. Take a picture of a plant with your phone camera, the app sends it to [planter-api](https://github.com/maszjan/planter-api) and displays the recognized species with a short description.

## How it works

1. The app asks for camera permission and shows a live preview.
2. After taking a photo (quality 0.5) it saves the image in the app storage (`documentDirectory/photos/`).
3. The image is sent as `multipart/form-data` (field `file`) to `POST /api/v1/recognize-plant/`.
4. The plant name and description from the response are shown next to the photo.
5. The "Zacznij od nowa" (start over) button returns to the camera.

## Tech stack

| Area       | Technology                                           |
| ---------- | ---------------------------------------------------- |
| Framework  | Expo SDK 52, React Native 0.76                       |
| Language   | TypeScript                                           |
| Navigation | Expo Router, React Navigation (native-stack)         |
| Camera     | expo-camera                                          |
| Files      | expo-file-system                                     |
| HTTP       | axios                                                |
| Icons      | react-native-vector-icons (MaterialCommunityIcons)   |
| Testing    | Jest with jest-expo                                  |

## Project structure

```
planter/
├── app/                  # Expo Router routes (_layout.tsx, index.tsx)
├── screens/
│   └── HomeScreen.tsx    # camera, photo upload, recognition result
├── hooks/                # useColorScheme, useThemeColor
├── constants/            # Colors.ts
├── assets/               # icons, splash screen
├── scripts/              # reset-project.js
├── App.tsx
└── app.json              # Expo configuration
```

## Requirements

- Node.js (LTS) and npm
- Expo Go on a phone, or an Android emulator / iOS simulator
- A running instance of [planter-api](https://github.com/maszjan/planter-api)

## Getting started

```bash
git clone https://github.com/maszjan/planter.git
cd planter
npm install
npm start
```

Scan the QR code with Expo Go, or run on a specific platform:

```bash
npm run android
npm run ios        # requires macOS
npm run web
```

### API address

The backend address is currently hardcoded in `screens/HomeScreen.tsx`:

```ts
axios.post("http://192.168.1.138:8000/api/v1/recognize-plant/", formData, ...)
```

Change it to the address of the machine running `planter-api`. The phone and the computer must be on the same network, and the server must be started with `--host 0.0.0.0`. `localhost` on a phone points to the phone itself, so it will not work.

## Scripts

| Command                 | Description                          |
| ----------------------- | ------------------------------------ |
| `npm start`             | start the Expo development server    |
| `npm run android`       | run on Android                       |
| `npm run ios`           | run on iOS                           |
| `npm run web`           | run in the browser                   |
| `npm test`              | run Jest in watch mode               |
| `npm run lint`          | run the Expo linter                  |
| `npm run reset-project` | reset the Expo starter template      |

## Known limitations and ideas

- The API URL is hardcoded; move it to an environment variable such as `EXPO_PUBLIC_API_URL`.
- There is no loading indicator or error message when recognition fails (errors only go to the console).
- `toggleCameraType` is defined, but there is no button to switch between the front and back camera.
- The camera permission prompt text is in English while the rest of the UI is in Polish.
- Possible additions: picking a photo from the gallery, recognition history, showing the English and scientific names (the API already returns them).
- Recognition results are model predictions and can be wrong, especially important since the descriptions mention edibility.

## Related repositories

- [planter-api](https://github.com/maszjan/planter-api): backend (FastAPI and a ResNet50 model)
