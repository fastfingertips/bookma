> [!NOTE]
> This project is currently under development and is not in its final state. It will be further developed.

<div align="center">

# 📚 Bookma

[![Build Status](https://github.com/fastfingertips/bookma/actions/workflows/ci.yml/badge.svg)](https://github.com/fastfingertips/bookma/actions/workflows/ci.yml)
[![License](https://img.shields.io/github/license/fastfingertips/bookma?logo=github&color=orange)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/fastfingertips/bookma?style=social)](https://github.com/fastfingertips/bookma/stargazers)
[![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-6da55f?logo=node.js&color=6da55f)](https://nodejs.org)

Netscape bookmark manager with local processing. Supports search, inline editing, and visual diffing within the browser.

[Usage](#usage) • [Tests](#tests) • [Development](#development)

---

### Features

**Local Processing** (Client-side) • **Search** • **Inline Editing** • **Hierarchy View** • **Diff View** • **Dark Mode Support**

</div>

---

### Usage

Bookma operates as a static web application. No data is transmitted to external servers.

1. **Clone the Repository**

   ```bash
   git clone https://github.com/fastfingertips/bookma.git
   cd bookmark-manager
   ```

2. **Run Locally**

   ```bash
   npm install
   npm run dev
   ```

3. **Build**
   ```bash
   npm run build
   ```

---

### Tests and Quality

The repository includes automated checks for code consistency and logic:

- **Linting**: ESLint rules for code formatting and import order.
- **Styling**: Prettier and Stylelint for CSS consistency.
- **Logic**: Unit tests via Vitest.
- **Security**: Dependency auditing with `npm audit`.
- **Optimization**: Redundancy detection via `jscpd`.

Execute all checks:

```bash
npm run test:all
```

---

### Development

- `src/core`: Parsing, sorting, and search logic.
- `src/ui`: DOM renderers and event handling.
- `src/styles`: CSS files.

---

### License

MIT License - see the [LICENSE](LICENSE) file for details.

---

### Star History

<div align="center">

[![Star History Chart](https://api.star-history.com/svg?repos=fastfingertips/bookma&theme=dark)](https://star-history.com/#fastfingertips/bookma&Date)

</div>

<div align="center">
<a href="https://github.com/fastfingertips">fastfingertips</a>
</div>
