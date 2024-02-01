# ViteJS and DDEV: how to make them play nice

According to this [blog post](https://ddev.com/blog/working-with-vite-in-ddev/), it is possible to work with Vite in a DDEV project. To do it, it is necessary to expose Vite's development server and change the Vite configuration to use DDEV project url.

So, how do we do all that?

## 1. Create the package.json file and install Vite

After creating a DDEV project and starting the container with `ddev start`, create a `package.json` file and save Vite as a dev dependency.

Add the type property to the package.json file

```json
"type": "module"
```

Also add the script commands to the file:

```json
"scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
}
```
## 2. Expose the Vite development server port
Right now Vite is installed in the DDEV container, but it cannot be accesed from the host system. To do it, it is necessary to expose the port 5173.

In `.ddev/config.yaml`, add the [web_extra_exposed_ports](https://ddev.readthedocs.io/en/latest/users/extend/customization-extendibility/#exposing-extra-ports-via-ddev-router) configuration option:

```yaml
web_extra_exposed_ports:
  - name: vite
    container_port: 5173
    http_port: 5172
    https_port: 5173
```

To make these changes go into effect, run the command `ddev restart`.

## 3. Change the Vite configuration

It is essential that the `vite.config.js` file has the following

```js 
import { defineConfig } from 'vite'
import path from 'path'

const port = 5173;
const origin = `${process.env.DDEV_PRIMARY_URL}:${port}`;

// https://vitejs.dev/config/
export default defineConfig({
    // Add entrypoint
    build: {
        // our entry
        rollupOptions: {
          input: path.resolve(__dirname, 'src/main.js'),
        },

        // manifest
        manifest: true
      },

    // Adjust Vites dev server for DDEV
    // https://vitejs.dev/config/server-options.html
    server: {
        // respond to all network requests:
        host: '0.0.0.0',
        port: port,
        strictPort: true, 
        // Defines the origin of the generated asset URLs during development
        origin: origin
    },

})
```

In the first place, the file should indicate yout application's  entry point using the `build.rollupOptions.input` property. We should also configure vite to generate the manifest file with `manfiest: true`

Secondly, the server option should allows us to:

- respond to every request using `host: 0.0.0.0`
- use the given port with `port: 5173`
- make Vite to not expose other ports with `strictPort: true` (Vite will expose other ports if 5173 is being used by another app)
- generate the proper hostname with the `origin` property.

## 4. Add Vite's generated file and the entry point to `index.php` or `index.html`

For development purposes, add the following assets to your index.php file:

```php
<script type="module" src="<?php echo $_SERVER['DDEV_PRIMARY_URL']; ?>:5173/@vite/client"></script>
<script type="module" src="<?php echo $_SERVER['DDEV_PRIMARY_URL']; ?>:5173/main.js"></script>
```

## 5. Now run Vite 
Run Vite with the command `ddev npm run dev`