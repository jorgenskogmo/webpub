---
title: "AA Project Example"
date: "2025-08-23"
author: "Jane Doe"
tags: ["typography", "images", "tables", "markdown", "example"]
summary: "A sample markdown file demonstrating frontmatter, typography, images, and tables for static site generators like Eleventy."
---

# AA Project Example

Welcome to the **AA Project** example markdown file. This file demonstrates:

<qdi-button variant="primary" onclick="alert('alo!')">say alo</qdi-button>
<qdi-button variant="primary" id="mybtn">say alo alo</qdi-button>

<script>
  document.querySelector("#mybtn").addEventListener("click", () => {
    alert("alo alo");
  })
</script>

- Frontmatter
- Headings
- Typography
- Images
- Tables
- Lists

## Typography

### Headings

# Heading 1

## Heading 2

### Heading 3

#### Heading 4

##### Heading 5

###### Heading 6

### Emphasis

*Italic text*

**Bold text**

***Bold and italic text***

> This is a blockquote. It can be used to highlight important information.

### Lists

- Unordered list item 1
- Unordered list item 2
  - Nested item

1. Ordered list item 1
2. Ordered list item 2
   1. Nested ordered item

## Images

![Sample Image](https://placehold.co/400x200.png?text=AA+Project+Image)

## Tables

| Feature      | Supported | Notes                       |
|-------------|-----------|-----------------------------|
| Frontmatter  | Yes       | YAML at the top of the file |
| Headings     | Yes       | All levels                  |
| Images       | Yes       | Markdown and HTML           |
| Tables       | Yes       | Standard markdown tables    |
| Lists        | Yes       | Ordered and unordered       |

## Code

```js
// Example JavaScript code block
console.log('Hello, AA Project!');
```

## Links

[Visit Eleventy](https://www.11ty.dev/)

---

*End of example markdown file.*
