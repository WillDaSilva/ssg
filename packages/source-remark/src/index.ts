// // note to future self - we no longer require extractSlugObjectFromArray - we just return an array
// // todo: update return result to give array
// // todo: return null if getdataslice not found

// var unified = require('unified')
// // var stream = require('unified-stream')
// var vfile = require('to-vfile')
// var report = require('vfile-reporter')
// const { produce } = require('immer')

// const { promisify } = require('util')
// const fs = require('fs')
// const path = require('path')
// const readdir = promisify(fs.readdir)
// const stat = promisify(fs.stat)
// const lstat = promisify(fs.lstat)
// const frontMatter = require('front-matter')

// const tob64 = (str: string) => Buffer.from(str).toString('base64')
// const fromb64 = (str: string) => Buffer.from(str, 'base64').toString()
// /**
//  *
//  * globals, we may have to make per-invocation in future
//  *
//  */

// let _recognizedExtensions = ['.md', '.markdown', '.mdx', '.svexy']
// let _preset = {
//   settings: {},
//   plugins: [
//     require('remark-parse'),
//     require('remark-slug'),
//     [
//       require('remark-autolink-headings'),
//       {
//         behavior: 'append',
//         content: {
//           type: 'element',
//           tagName: 'span',
//           properties: { className: ['icon', 'icon-link'] },
//           children: [{ type: 'text', value: ' 🔗' }],
//         },
//       },
//     ],
//     require('remark-toc'),
//     require('remark-sectionize'),
//     require('remark-rehype'),
//     require('rehype-format'),
//     [require('remark-frontmatter'), ['yaml']],
//     [require('rehype-shiki'), { theme: 'Material-Theme-Palenight' }],
//     require('rehype-stringify'),
//   ],
// }

// type PluginOpts = {
//   dirPath?: string
//   filterType: 'all' | 'current' | undefined
//   modifyRecognizedExtensions?: string
//   modifyRemarkConfig?: string
//   // onCreateIndex?: (index: {
//   //     [slug: string]: SSGRemarkPluginFile;
//   // }) => Promise<void>
// }
// type SSGRemarkPluginFile = { uid: string; createdAt: Date; modifiedAt: Date; metadata: any }
// module.exports = function(opts: PluginOpts) {
//   if (!opts.dirPath) throw new Error('dirpath not supplied to remark plugin')
//   if (opts.modifyRecognizedExtensions) {
//     _recognizedExtensions = produce(_recognizedExtensions, opts.modifyRecognizedExtensions)
//   }
//   if (opts.modifyRemarkConfig) {
//     _preset = produce(_preset, opts.modifyRemarkConfig)
//   }

//   // flattens all directories below the dirPath
//   // is recursive!
//   async function createIndex(recursiveDir = opts.dirPath) {
//     const files = await readdir(recursiveDir)
//     const getStats = async (file: string, _dirPath: string) => {
//       const filePath = path.join(_dirPath, file)
//       const st = await stat(filePath)
//       if (st.isDirectory()) {
//         const temp = await createIndex(filePath) // recursion
//         return Object.values(temp) // take it back out of an object into an array
//       } else {
//         if (file === '.DS_Store') return // skip ds store...
//         if (!_recognizedExtensions.includes(path.extname(file))) return // skip
//         return [
//           {
//             uid: tob64(filePath),
//             createdAt: st.birthtime,
//             modifiedAt: st.mtime,
//           },
//         ]
//       }
//     }
//     const arrs: (SSGRemarkPluginFile[])[] = await Promise.all(files.map((file: string) => getStats(file, recursiveDir)))
//     const strArr = [] as SSGRemarkPluginFile[]
//     let index = strArr.concat.apply([], arrs) // ghetto flatten
//     index = index
//       .filter(Boolean)
//       .map((file) => {
//         const temp = fs.readFileSync(fromb64(file.uid), 'utf-8')
//         const { attributes: metadata } = frontMatter(temp)
//         if (!metadata) return // require metadata
//         if (!metadata.title) return // require title
//         if (metadata.published === false) return // if published is false
//         let pubdate = metadata.date || new Date().toString().slice(4, 15)
//         const date = new Date(`${pubdate} EDT`) // cheeky hack
//         metadata.pubdate = pubdate
//         metadata.date = new Date(pubdate)
//         metadata.dateString = date.toDateString()
//         file.metadata = metadata
//         return file
//       })
//       .filter(notEmpty)
//       .sort((a, b) => {
//         return a!.metadata.pubdate < b!.metadata.pubdate ? 1 : -1
//       })
//       .filter((x) => (opts.filterType === 'all' ? true : new Date(x!.metadata.date) <= new Date()))
//     const result = extractSlugObjectFromArray(index)
//     // // i dont really use this yet
//     // if (opts.onCreateIndex) {
//     //   await opts.onCreateIndex(result) // optional logging
//     // }
//     return result
//   }

//   // https://stackoverflow.com/questions/43118692/typescript-filter-out-nulls-from-an-array
//   function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
//     return value !== null && value !== undefined
//   }

//   async function getDataSlice(uid: string) {
//     const filepath = fromb64(uid)
//     const md = vfile.readSync(filepath)
//     const file = await unified()
//       .use(_preset)
//       .process(md)
//       .catch((err: Error) => {
//         console.error(report(md))
//         throw err
//       })
//     file.extname = '.html'
//     return file.toString()
//   }

//   return {
//     createIndex,
//     getDataSlice,
//   }
// }

// function extractSlugObjectFromArray(arr: SSGRemarkPluginFile[]) {
//   let obj = {} as { [slug: string]: SSGRemarkPluginFile }
//   arr.forEach((item) => (obj[item.metadata.slug] = item))
//   return obj
// }
