---
title: "BB Project Example"
date: "2025-08-23"
author: "John Smith"
tags: ["typography", "images", "tables", "markdown", "example"]
summary: "A sample markdown file for the BB project, demonstrating frontmatter, headings, images, tables, and code blocks."
---

# BB Project Example

Welcome to the **BB Project** example markdown file. This file demonstrates:

Some lit-components:

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

> This is a blockquote for the BB project.

### Lists

- Unordered list item A
- Unordered list item B
  - Nested item

1. Ordered list item A
2. Ordered list item B
   1. Nested ordered item

## Images

![BB Project Image](https://placehold.co/400x200.png?text=BB+Project+Image)

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
// BB Project JavaScript example
console.log('Hello, BB Project!');
```

## Links

[Visit Eleventy](https://www.11ty.dev/)

---

*End of BB project example markdown file.*
