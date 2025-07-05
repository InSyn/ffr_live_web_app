# Руководство по Миграции: Семантическая Цветовая Система

**Версия:** 2.0
**Дата:** Декабрь 2024
**Статус:** Готов к выполнению
**Приоритет:** Средний (после унификации поиска)

---

## 🎯 **Обзор Миграции**

Переход от legacy цветовых переменных к новой, многоуровневой семантической системе цветов. Новая система вводит сырую цветовую палитру и семантические псевдонимы для создания более устойчивой, поддерживаемой и темизируемой системы дизайна.

Основная работа выполнена в `frontend/src/assets/styles/abstracts/_variables.scss`. Старые переменные помечены как deprecated, но остаются функциональными до завершения миграции.

---

## 🛠️ **Процесс Миграции**

### **Инструменты для Автоматизации**

Для эффективной миграции рекомендуется использовать regex-based поиск и замена в IDE:

1. **VS Code:** Ctrl+Shift+H (Find and Replace in Files)
2. **Включить Regex:** Установить флаг `.*/`
3. **Scope:** `frontend/src/**/*.vue` и `frontend/src/**/*.scss`

### **Пример Замены**

```bash
# Поиск
var\(--text-default\)

# Замена
var(--color-text-primary)
```

---

## 📊 **Таблица Маппинга Переменных**

| Legacy Переменная | Новая Семантическая Переменная | Контекст Использования |
|:------------------|:-------------------------------|:-----------------------|
| `var(--text-default)` | `var(--color-text-primary)` | Основной текст для body контента |
| `var(--text-muted)` | `var(--color-text-secondary)` | Вторичный текст, менее важная информация |
| `var(--text-depressed)` | `var(--color-text-secondary)` | ⚠️ Deprecated. Использовать `text-secondary` |
| `var(--text-contrast)` | `var(--color-text-on-brand)` | Текст на брендовом фоне |
| `var(--text-card-contrast)` | `var(--color-text-on-brand)` | Объединено с `text-on-brand` |
| `var(--accent)` | `var(--color-text-accent)` | Акцентный текст |
| `var(--success)` | `var(--color-text-success)` | Сообщения успеха |
| `var(--message-error)` | `var(--color-text-error)` | Сообщения об ошибках |
| `var(--icon-color)` | `var(--color-text-primary)` | Иконки наследуют цвет основного текста |

### **Фоновые Цвета**

| Legacy Переменная | Новая Семантическая Переменная | Контекст Использования |
|:------------------|:-------------------------------|:-----------------------|
| `var(--background-primary)` | `var(--color-bg-primary)` | Основной фон большинства страниц |
| `var(--background-secondary)` | `var(--color-bg-secondary)` | Вторичный фон для отдельных секций |
| `var(--background-card)` | `var(--color-bg-surface)` | Фон для карточек, модалов и плавающих поверхностей |
| `var(--background-card-hovered)` | `var(--color-bg-surface-hover)` | Hover состояние для поверхностей |
| `var(--background-card-secondary)` | `var(--color-bg-surface-secondary)` | Вторичный цвет поверхности для инпутов |

### **Границы и Интерактивные Элементы**

| Legacy Переменная | Новая Семантическая Переменная | Контекст Использования |
|:------------------|:-------------------------------|:-----------------------|
| `var(--border-container)` | `var(--color-border-primary)` | Основной цвет границ для контейнеров |
| `var(--border-photo)` | `var(--color-border-photo)` | Специальный цвет границ для фото/аватаров |
| `var(--ffr-brand)` | `var(--color-interactive-brand-default)` | Основной интерактивный брендовый цвет |

### **⚠️ Удаленные/Устаревшие Переменные**

| Legacy Переменная | Рекомендуемая Замена | Причина |
|:------------------|:---------------------|:--------|
| `var(--ffr-brand-accent)` | `var(--raw-brand-red-500)` | Перенесено в сырую палитру |
| `var(--athlete-blue)` | `var(--raw-status-blue-500)` | Специфичные цвета → сырая палитра |
| `var(--athlete-red)` | `var(--raw-status-red-600)` | Специфичные цвета → сырая палитра |
| `var(--athlete-green)` | `var(--raw-status-green-600)` | Специфичные цвета → сырая палитра |
| `var(--athlete-yellow)` | `var(--raw-status-yellow-500)` | Специфичные цвета → сырая палитра |

---

## 🔍 **Алгоритм Миграции**

### **Этап 1: Автоматизированная Замена (80% случаев)**

```bash
# Пример bash script для массовой замены
#!/bin/bash

# Массив замен (legacy → new)
declare -A color_map=(
  ["--text-default"]="--color-text-primary"
  ["--text-muted"]="--color-text-secondary"
  ["--background-primary"]="--color-bg-primary"
  ["--background-card"]="--color-bg-surface"
  ["--border-container"]="--color-border-primary"
  ["--ffr-brand"]="--color-interactive-brand-default"
)

# Выполнить замены во всех .vue файлах
for old in "${!color_map[@]}"; do
  new="${color_map[$old]}"
  find frontend/src -name "*.vue" -exec sed -i "s/var(${old})/var(${new})/g" {} +
done
```

### **Этап 2: Ручная Проверка (20% случаев)**

Случаи, требующие ручной проверки:

1. **Athlete-specific colors** → нужно определить семантический контекст
2. **Dynamic color assignments** в JavaScript коде
3. **Условные стили** в зависимости от состояния
4. **Theme-specific overrides**

### **Этап 3: Валидация**

```bash
# Проверить, остались ли legacy переменные
grep -r "var(--text-default)" frontend/src/
grep -r "var(--background-card)" frontend/src/
# ... проверить все legacy переменные
```

---

## 🧪 **Тестирование Миграции**

### **Визуальная Регрессия**

1. **Snapshot Testing:** Сделать скриншоты ключевых страниц до миграции
2. **Theme Switching:** Проверить светлую и темную темы
3. **Component Isolation:** Протестировать компоненты в Storybook (если доступен)

### **Браузерное Тестирование**

```javascript
// Простой тест для проверки применения переменных
const computedStyle = getComputedStyle(document.documentElement)
const primaryText = computedStyle.getPropertyValue('--color-text-primary')
console.log('Primary text color:', primaryText)
```

---

## 🚨 **Критические Моменты**

### **1. Hover States**

Legacy переменные типа `--text-hovered` удалены. Используйте:

```scss
// Старый подход
color: var(--text-hovered);

// Новый подход
color: var(--color-text-primary);
&:hover {
  color: var(--color-text-accent);
}
```

### **2. Athlete Status Colors**

```scss
// Старый подход
.athlete-status {
  &--first { color: var(--athlete-blue); }
  &--second { color: var(--athlete-red); }
}

// Новый подход
.athlete-status {
  &--first { color: var(--raw-status-blue-500); }
  &--second { color: var(--raw-status-red-600); }
}
```

### **3. Conditional Theming**

```scss
// Проверить что семантические переменные автоматически адаптируются
.component {
  background: var(--color-bg-surface); // Автоматически light/dark
  color: var(--color-text-primary);    // Автоматически light/dark
}
```

---

## 📋 **Чеклист Выполнения**

### **Подготовка**

- [ ] Создать git branch для миграции
- [ ] Сделать backup текущих стилей
- [ ] Подготовить скрипты автоматизации

### **Выполнение**

- [ ] Запустить автоматизированную замену
- [ ] Проверить каждую категорию переменных:
  - [ ] Текстовые цвета (8 переменных)
  - [ ] Фоновые цвета (5 переменных)
  - [ ] Границы и интерактивные (3 переменные)
  - [ ] Специальные athlete/status цвета (4 переменные)
- [ ] Обработать edge cases вручную
- [ ] Обновить условные стили и hover states

### **Валидация**

- [ ] Визуальная проверка всех основных страниц
- [ ] Тестирование переключения тем
- [ ] Проверка адаптивности
- [ ] Browser compatibility test
- [ ] Accessibility contrast verification

### **Завершение**

- [ ] Удалить deprecated переменные из `_variables.scss`
- [ ] Обновить documentation
- [ ] Code review команды
- [ ] Merge в main branch

---

## 🎯 **Ожидаемые Результаты**

1. **Семантическая ясность:** Переменные отражают их назначение, а не внешний вид
2. **Улучшенная темизация:** Автоматическая адаптация к светлой/темной теме
3. **Легкость поддержки:** Изменения цветов в одном месте
4. **Соответствие стандартам:** Следование современным практикам CSS архитектуры
5. **Основа для расширения:** Простота добавления новых цветовых тем

---

**Оценка времени:** 4-6 часов для полной миграции
**Риски:** Низкие (обратимые изменения, legacy переменные остаются до завершения)
**Зависимости:** Требует завершения унификации поиска для исключения конфликтов
