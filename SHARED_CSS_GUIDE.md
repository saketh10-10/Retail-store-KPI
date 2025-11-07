# Shared CSS Module Guide

## Overview
A single, consistent CSS module (`shared.module.css`) that all pages can use for uniform styling across the application.

## ✅ Changes Made

### 1. **Product Persistence Fixed**
- Products now save to `backend/data/products.json`
- Bills save to `backend/data/bills.json`
- Deleted products stay deleted
- No more auto-reset on server restart

### 2. **Manufacturing/Expiry Dates Removed from Non-Perishable Items**
Only perishable items have dates:
- ✅ **With Dates**: Sandwich, Milk, Bread, Butter (Food/Dairy items)
- ❌ **No Dates**: Soap, Soft Drink, Soda Water, Socks, Sunglasses, Shampoo

### 3. **24H Button Removed from Dashboard**
- Cleaner header
- Only "Location Intelligence" button remains

### 4. **Shared CSS Module Created**
- File: `frontend/src/styles/shared.module.css`
- Based on dashboard styling
- Consistent dark theme across all pages

---

## 📁 File Structure

```
frontend/src/
├── styles/
│   └── shared.module.css  ← NEW: Shared CSS module
├── pages/
│   ├── DashBoard.tsx
│   ├── DashBoard.module.css
│   ├── ProductsPage.tsx
│   ├── ProductsPage.module.css
│   └── ... (other pages)
```

---

## 🎨 How to Use Shared CSS

### Import in Your Component

```tsx
import styles from '../styles/shared.module.css';
```

### Basic Page Structure

```tsx
import React from 'react';
import styles from '../styles/shared.module.css';

const MyPage = () => {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>My Page Title</h1>
        <div className={styles.navButtons}>
          <button>Action Button</button>
        </div>
      </header>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Card Title</h2>
        {/* Content */}
      </div>
    </div>
  );
};
```

---

## 📚 Available Classes

### Layout Classes

| Class | Description |
|-------|-------------|
| `.page` | Main page container (dark background, padding) |
| `.header` | Page header with flex layout |
| `.card` | Card/section container |
| `.cardHeader` | Card header with title and actions |
| `.cardTitle` | Card title text |

### Button Classes

| Class | Description |
|-------|-------------|
| `.button` | Default button |
| `.buttonPrimary` | Blue primary button |
| `.buttonSecondary` | Gray secondary button |
| `.buttonDanger` | Red danger button |
| `.navButtons` | Container for navigation buttons |

### Form Classes

| Class | Description |
|-------|-------------|
| `.form` | Form container |
| `.formGroup` | Form field group |
| `.input` | Text input field |
| `.select` | Select dropdown |
| `.textarea` | Textarea field |

### Table Classes

| Class | Description |
|-------|-------------|
| `.table` | Table with dark theme |
| `.table thead` | Table header |
| `.table th` | Table header cell |
| `.table td` | Table data cell |

### Message Classes

| Class | Description |
|-------|-------------|
| `.error` | Red error message |
| `.success` | Green success message |
| `.warning` | Yellow warning message |
| `.info` | Blue info message |

### Badge Classes

| Class | Description |
|-------|-------------|
| `.badge` | Base badge |
| `.badgePrimary` | Blue badge |
| `.badgeSuccess` | Green badge |
| `.badgeDanger` | Red badge |
| `.badgeWarning` | Yellow badge |
| `.badgeInfo` | Blue info badge |

### Grid Classes

| Class | Description |
|-------|-------------|
| `.grid` | Base grid |
| `.grid2` | 2-column responsive grid |
| `.grid3` | 3-column responsive grid |
| `.grid4` | 4-column responsive grid |

### Flex Utilities

| Class | Description |
|-------|-------------|
| `.flexRow` | Flex row with gap |
| `.flexColumn` | Flex column with gap |
| `.flexCenter` | Center content |
| `.flexBetween` | Space between |

### Text Utilities

| Class | Description |
|-------|-------------|
| `.textCenter` | Center text |
| `.textRight` | Right align text |
| `.textMuted` | Muted gray text |
| `.textBold` | Bold text |

### Spacing Utilities

| Class | Description |
|-------|-------------|
| `.mt10`, `.mt20`, `.mt30` | Margin top |
| `.mb10`, `.mb20`, `.mb30` | Margin bottom |
| `.p10`, `.p20`, `.p30` | Padding |

---

## 🎯 Example Usage

### Example 1: Simple Page

```tsx
import React from 'react';
import styles from '../styles/shared.module.css';

const SettingsPage = () => {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>⚙️ Settings</h1>
      </header>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>General Settings</h2>
        <form className={styles.form}>
          <div className={styles.formGroup}>
            <label>Store Name</label>
            <input type="text" className={styles.input} />
          </div>
          <button className={styles.buttonPrimary}>Save</button>
        </form>
      </div>
    </div>
  );
};
```

### Example 2: Page with Grid

```tsx
import React from 'react';
import styles from '../styles/shared.module.css';

const ReportsPage = () => {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>📊 Reports</h1>
      </header>

      <div className={`${styles.grid} ${styles.grid3}`}>
        <div className={styles.card}>
          <h3>Sales Report</h3>
          <p className={styles.textMuted}>Last 30 days</p>
        </div>
        <div className={styles.card}>
          <h3>Inventory Report</h3>
          <p className={styles.textMuted}>Current stock</p>
        </div>
        <div className={styles.card}>
          <h3>Customer Report</h3>
          <p className={styles.textMuted}>Active customers</p>
        </div>
      </div>
    </div>
  );
};
```

### Example 3: Page with Table

```tsx
import React from 'react';
import styles from '../styles/shared.module.css';

const UsersPage = () => {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>👥 Users</h1>
        <button className={styles.buttonPrimary}>Add User</button>
      </header>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>John Doe</td>
            <td>john@example.com</td>
            <td><span className={styles.badgePrimary}>Manager</span></td>
            <td>
              <button className={styles.button}>Edit</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
```

---

## 🎨 Color Scheme

### Background Colors
- **Page Background**: `#0a0f1f` (Dark blue-black)
- **Card Background**: `#13192d` (Slightly lighter)
- **Button Background**: `#1d2335` (Medium dark)
- **Hover Background**: `#2e3650` (Lighter on hover)

### Text Colors
- **Primary Text**: `white`
- **Muted Text**: `#b8c1d9` (Light gray-blue)

### Accent Colors
- **Primary**: `#4a90e2` (Blue)
- **Success**: `#28a745` (Green)
- **Danger**: `#dc3545` (Red)
- **Warning**: `#ffc107` (Yellow)
- **Info**: `#17a2b8` (Cyan)

---

## 🔄 Migration Guide

### Converting Existing Pages

**Before:**
```tsx
import styles from './MyPage.module.css';

<div className={styles.container}>
  <h1 className={styles.title}>Title</h1>
</div>
```

**After:**
```tsx
import styles from '../styles/shared.module.css';

<div className={styles.page}>
  <h1>Title</h1>
</div>
```

### Keeping Custom Styles

You can still use page-specific CSS for unique elements:

```tsx
import sharedStyles from '../styles/shared.module.css';
import customStyles from './MyPage.module.css';

<div className={sharedStyles.page}>
  <div className={sharedStyles.card}>
    <div className={customStyles.specialElement}>
      {/* Custom styled element */}
    </div>
  </div>
</div>
```

---

## 📱 Responsive Design

The shared CSS includes responsive breakpoints:

- **Desktop**: Full layout
- **Tablet/Mobile** (< 768px):
  - Reduced padding
  - Smaller font sizes
  - Single column grids
  - Full-width buttons

---

## 🎯 Benefits

### 1. **Consistency**
- All pages look and feel the same
- Same colors, spacing, and components
- Professional appearance

### 2. **Maintainability**
- Update styles in one place
- Changes apply to all pages
- Less code duplication

### 3. **Development Speed**
- Pre-built components
- No need to write CSS for common elements
- Copy-paste examples

### 4. **Responsive by Default**
- Mobile-friendly out of the box
- Tested breakpoints
- Flexible layouts

---

## 🚀 Next Steps

### Recommended Updates:

1. **Update ProductsPage**
   ```tsx
   import styles from '../styles/shared.module.css';
   // Use shared.page, shared.card, shared.button, etc.
   ```

2. **Update BillingPage**
   ```tsx
   import styles from '../styles/shared.module.css';
   // Use shared.table, shared.form, etc.
   ```

3. **Update TrendingPage**
   ```tsx
   import styles from '../styles/shared.module.css';
   // Use shared.grid, shared.card, etc.
   ```

4. **Update LocationPage**
   ```tsx
   import styles from '../styles/shared.module.css';
   // Use shared.page, shared.header, etc.
   ```

---

## 📝 Best Practices

1. **Use shared styles first** - Check if a class exists before creating custom CSS
2. **Combine classes** - Use multiple classes for complex styling
3. **Keep custom CSS minimal** - Only for truly unique elements
4. **Follow naming conventions** - Use camelCase for class names
5. **Test responsiveness** - Check on mobile devices

---

## 🐛 Troubleshooting

### Styles Not Applying?

1. Check import path: `import styles from '../styles/shared.module.css';`
2. Verify class name: `className={styles.page}` (not `className="page"`)
3. Check for typos in class names
4. Ensure CSS module is in the correct location

### Conflicts with Existing Styles?

1. Use more specific selectors
2. Combine shared and custom classes
3. Override with `!important` (last resort)

---

**Implementation Date**: October 27, 2024
**Version**: 1.0.0
**Status**: ✅ Ready to Use
