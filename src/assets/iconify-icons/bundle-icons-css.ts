/**
 * This is an advanced example for creating icon bundles for Iconify SVG Framework.
 *
 * It creates a bundle from:
 * - All SVG files in a directory.
 * - Custom JSON files.
 * - Iconify icon sets.
 * - SVG framework.
 *
 * This example uses Iconify Tools to import and clean up icons.
 * For Iconify Tools documentation visit https://docs.iconify.design/tools/tools2/
 */
import { promises as fs } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

// Installation: npm install --save-dev @iconify/tools @iconify/utils @iconify/json @iconify/iconify
import { cleanupSVG, importDirectory, isEmptyColor, parseColors, runSVGO } from '@iconify/tools'
import type { IconifyJSON } from '@iconify/types'
import { getIcons, getIconsCSS, stringToIcon } from '@iconify/utils'

const require = createRequire(import.meta.url)

async function generateIconsCSS() {
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = dirname(__filename)

  /**
   * Script configuration
   */
  interface BundleScriptCustomSVGConfig {
    // eslint-disable-next-line lines-around-comment
    // Path to SVG files
    dir: string

    // True if icons should be treated as monotone: colors replaced with currentColor
    monotone: boolean

    // Icon set prefix
    prefix: string
  }

  interface BundleScriptCustomJSONConfig {
    // eslint-disable-next-line lines-around-comment
    // Path to JSON file
    filename: string

    // List of icons to import. If missing, all icons will be imported
    icons?: string[]
  }

  interface BundleScriptConfig {
    // eslint-disable-next-line lines-around-comment
    // Custom SVG to import and bundle
    svg?: BundleScriptCustomSVGConfig[]

    // Icons to bundled from @iconify/json packages
    icons?: string[]

    // List of JSON files to bundled
    // Entry can be a string, pointing to filename or a BundleScriptCustomJSONConfig object (see type above)
    // If entry is a string or object without 'icons' property, an entire JSON file will be bundled
    json?: (string | BundleScriptCustomJSONConfig)[]
  }

  const sources: BundleScriptConfig = {
    json: [
      // Iconify JSON file (@iconify/json is a package name, /json/ is directory where files are, then filename)
      require.resolve('@iconify/json/json/ri.json')

      // Custom file with only few icons
      /* {
        filename: require.resolve('@iconify/json/json/line-md.json'),
        icons: ['home-twotone-alt', 'github', 'document-list', 'document-code', 'image-twotone']
      } */

      // Custom JSON file
      // 'json/gg.json'
    ],

    icons: [
      'bx-basket',
      'bi-airplane-engines',
      'tabler-anchor',
      'uit-adobe-alt',
      'twemoji-auto-rickshaw',

      // Solar icons - full app icon set
      'solar-home-smile-linear',
      'solar-calendar-linear',
      'solar-calendar-mark-linear',
      'solar-calendar-add-linear',
      'solar-user-circle-linear',
      'solar-user-linear',
      'solar-user-plus-linear',
      'solar-user-check-linear',
      'solar-user-block-linear',
      'solar-user-heart-linear',
      'solar-user-id-linear',
      'solar-chart-square-linear',
      'solar-chart-2-linear',
      'solar-graph-up-linear',
      'solar-pie-chart-2-linear',
      'solar-users-group-rounded-linear',
      'solar-users-group-two-rounded-linear',
      'solar-share-circle-linear',
      'solar-widget-2-linear',
      'solar-shield-keyhole-linear',
      'solar-shield-star-linear',
      'solar-settings-minimalistic-linear',
      'solar-magnifer-linear',
      'solar-bell-linear',
      'solar-star-linear',
      'solar-star-bold',
      'solar-star-shine-linear',
      'solar-add-circle-linear',
      'solar-pen-new-square-linear',
      'solar-pen-linear',
      'solar-trash-bin-trash-linear',
      'solar-eye-linear',
      'solar-eye-closed-linear',
      'solar-file-text-linear',
      'solar-file-check-linear',
      'solar-file-remove-linear',
      'solar-file-favourite-linear',
      'solar-close-circle-linear',
      'solar-close-square-linear',
      'solar-check-circle-linear',
      'solar-check-read-linear',
      'solar-arrow-right-linear',
      'solar-arrow-left-linear',
      'solar-arrow-up-linear',
      'solar-arrow-down-linear',
      'solar-alt-arrow-right-linear',
      'solar-alt-arrow-left-linear',
      'solar-alt-arrow-down-linear',
      'solar-export-linear',
      'solar-download-linear',
      'solar-upload-linear',
      'solar-cloud-upload-linear',
      'solar-logout-2-linear',
      'solar-lock-linear',
      'solar-lock-keyhole-linear',
      'solar-map-point-linear',
      'solar-phone-linear',
      'solar-letter-linear',
      'solar-letter-opened-linear',
      'solar-clock-circle-linear',
      'solar-hand-money-linear',
      'solar-hand-heart-linear',
      'solar-document-add-linear',
      'solar-document-text-linear',
      'solar-danger-triangle-linear',
      'solar-info-circle-linear',
      'solar-running-2-linear',
      'solar-book-linear',
      'solar-buildings-linear',
      'solar-buildings-2-linear',
      'solar-cup-star-linear',
      'solar-global-linear',
      'solar-palette-round-linear',
      'solar-image-linear',
      'solar-gallery-add-linear',
      'solar-link-linear',
      'solar-money-bag-linear',
      'solar-medal-star-linear',
      'solar-heart-linear',
      'solar-cake-linear',
      'solar-square-academic-cap-linear',
      'solar-monitor-linear',
      'solar-smartphone-linear',
      'solar-video-frame-linear',
      'solar-menu-dots-linear',
      'solar-hamburger-menu-linear',
      'solar-save-linear',
      'solar-sun-linear',
      'solar-moon-linear',
      'solar-translation-linear',
      'solar-people-nearby-linear',
      'solar-home-linear',
      'solar-map-linear',
      'solar-notebook-linear',
      'solar-church-linear',
      'solar-clipboard-text-linear',
      'solar-circle-bottom-up-linear',
      'solar-copy-linear',
      'solar-notification-unread-linear',
      'solar-verified-check-linear',
      'solar-minus-circle-linear',
      'solar-sort-from-bottom-to-top-linear',
      'solar-sort-from-top-to-bottom-linear',
      'solar-login-2-linear',
      'solar-restart-linear',
      'solar-tuning-linear'
    ],

    svg: [
      /* {
        dir: 'src/assets/iconify-icons/svg',
        monotone: false,
        prefix: 'custom'
      } */
      /* {
        dir: 'src/assets/iconify-icons/emojis',
        monotone: false,
        prefix: 'emoji'
      } */
    ]
  }

  // File to save bundle to
  const target = join(__dirname, 'generated-icons.css')

  /**
   * Do stuff!
   */

  // Create directory for output if missing
  const dir = dirname(target)

  try {
    await fs.mkdir(dir, {
      recursive: true
    })
  } catch {
    //
  }

  const allIcons: IconifyJSON[] = []

  /**
   * Convert sources.icons to sources.json
   */
  if (sources.icons) {
    const sourcesJSON = sources.json ? sources.json : (sources.json = [])

    // Sort icons by prefix
    const organizedList = organizeIconsList(sources.icons)

    for (const prefix in organizedList) {
      const filename = require.resolve(`@iconify/json/json/${prefix}.json`)

      sourcesJSON.push({
        filename,
        icons: organizedList[prefix]
      })
    }
  }

  /**
   * Bundle JSON files and collect icons
   */
  if (sources.json) {
    for (let i = 0; i < sources.json.length; i++) {
      const item = sources.json[i]

      // Load icon set
      const filename = typeof item === 'string' ? item : item.filename
      const content = JSON.parse(await fs.readFile(filename, 'utf8')) as IconifyJSON

      // Filter icons
      if (typeof item !== 'string' && item.icons?.length) {
        const filteredContent = getIcons(content, item.icons)

        if (!filteredContent) throw new Error(`Cannot find required icons in ${filename}`)

        // Collect filtered icons
        allIcons.push(filteredContent)
      } else {
        // Collect all icons from the JSON file
        allIcons.push(content)
      }
    }
  }

  /**
   * Bundle custom SVG icons and collect icons
   */
  if (sources.svg) {
    for (let i = 0; i < sources.svg.length; i++) {
      const source = sources.svg[i]

      // Import icons
      const iconSet = await importDirectory(source.dir, {
        prefix: source.prefix
      })

      // Validate, clean up, fix palette, etc.
      await iconSet.forEach(async (name, type) => {
        if (type !== 'icon') return

        // Get SVG instance for parsing
        const svg = iconSet.toSVG(name)

        if (!svg) {
          // Invalid icon
          iconSet.remove(name)

          return
        }

        // Clean up and optimise icons
        try {
          // Clean up icon code
          await cleanupSVG(svg)

          if (source.monotone) {
            // Replace color with currentColor, add if missing
            // If icon is not monotone, remove this code
            await parseColors(svg, {
              defaultColor: 'currentColor',
              callback: (attr, colorStr, color) => {
                return !color || isEmptyColor(color) ? colorStr : 'currentColor'
              }
            })
          }

          // Optimise
          await runSVGO(svg)
        } catch (err) {
          // Invalid icon
          console.error(`Error parsing ${name} from ${source.dir}:`, err)
          iconSet.remove(name)

          return
        }

        // Update icon from SVG instance
        iconSet.fromSVG(name, svg)
      })

      // Collect the SVG icon
      allIcons.push(iconSet.export())
    }
  }

  // Generate CSS from collected icons
  const cssContent = allIcons
    .map(iconSet => getIconsCSS(iconSet, Object.keys(iconSet.icons), { iconSelector: '.{prefix}-{name}' }))
    .join('\n')

  // Save the CSS to a file
  await fs.writeFile(target, cssContent, 'utf8')

  console.log(`Saved CSS to ${target}!`)
}

generateIconsCSS().catch(err => {
  console.error(err)
})

/**
 * Sort icon names by prefix
 */
function organizeIconsList(icons: string[]): Record<string, string[]> {
  const sorted: Record<string, string[]> = Object.create(null)

  icons.forEach(icon => {
    const item = stringToIcon(icon)

    if (!item) return

    const prefix = item.prefix
    const prefixList = sorted[prefix] ? sorted[prefix] : (sorted[prefix] = [])

    const name = item.name

    if (!prefixList.includes(name)) prefixList.push(name)
  })

  return sorted
}
