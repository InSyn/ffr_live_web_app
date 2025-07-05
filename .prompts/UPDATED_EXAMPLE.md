# 🎯 **Стратегия использования гайдов в Cursor**

## **1. Пассивное действие (Cursor Rules)**

**✅ УЖЕ НАСТРОЕНО** - эти файлы автоматически загружаются при каждом чате:

```markdown
📁 .cursorrules или cursor_rules/
├── architectural-guide.mdc ✅ (активен как cursor rule)
├── design-system-guide.mdc ✅ (активен как cursor rule) 
├── general-rules.mdc ✅ (активен как cursor rule)
└── multi-agent-workflow.mdc ✅ (активен как cursor rule)
```

**Преимущества пассивного режима:**

- Автоматически применяются во всех чатах
- Не требуют ручного прикрепления
- Обеспечивают консистентность подходов

## **2. Активное прикрепление к Composer**

**Прикрепляйте ТОЛЬКО когда:**

### **🔧 Backend задачи:**

```markdown
@architectural-guide.mdc  # Для API стандартов и паттернов
```

### **🎨 Frontend/UI задачи:**

```markdown
@design-system-guide.mdc  # Для стилизации и компонентов
@architectural-guide.mdc  # Для Vue/Vuex паттернов
```

### **🚀 Сложные архитектурные задачи:**

```markdown
@multi-agent-workflow.mdc  # Для координации изменений
@architectural-guide.mdc   # Для принятия решений
```

### **📋 Планирование и анализ:**

```markdown
@general-rules.mdc  # Для выбора подходов и метрик
```

## **3. Контекстное прикрепление файлов**

**Всегда прикрепляйте релевантные файлы кода:**

```markdown
# Для задач унификации поиска:
@pages/athletes/index.vue           # Текущее состояние
@pages/events/calendar-page/index.vue  # Эталонная реализация
@store/modules/search.js            # Централизованное состояние
@backend/controllers/athlete-controller.js  # Backend логика
```

## **4. Оптимальные паттерны использования**

### **Паттерн для типовых задач:**

```markdown
🎯 **Задача:** Унификация поиска на странице Athletes

📎 **Прикрепить:**
@architectural-guide.mdc  # ADR-001 паттерн
@pages/athletes/index.vue  # Текущий код
@pages/events/calendar-page/index.vue  # Эталон

💬 **Промпт:** 
"Рефакторинг Athletes страницы по ADR-001 паттерну. 
Использовать Events как эталон. Применить supervised learning подход."
```

### **Паттерн для UI задач:**

```markdown
🎯 **Задача:** Создание нового компонента

📎 **Прикрепить:**
@design-system-guide.mdc  # Стили и паттерны
@components/ui-components/search/  # Примеры компонентов

💬 **Промпт:**
"Создать компонент следуя design tokens. 
Использовать surface-card паттерн и semantic colors."
```

## **5. Cursor IDE специфичные рекомендации**

### **Используйте Cursor Commands:**

```bash
# Быстрый поиск по гайдам
Cmd+K → "find pattern in architectural-guide"

# Быстрое применение паттернов  
Cmd+L → "@architectural-guide.mdc apply ADR-001 to current file"
```

### **Используйте Cursor Composer эффективно:**

```markdown
# ✅ ХОРОШО: Конкретная задача + релевантный контекст
@architectural-guide.mdc @pages/athletes/index.vue
"Рефакторинг по ADR-001 паттерну"

# ❌ ПЛОХО: Слишком много контекста без фокуса
@architectural-guide.mdc @design-system-guide.mdc @general-rules.mdc 
@multi-agent-workflow.mdc @pages/ @store/ @backend/
"Сделай что-то с проектом"
```

## **6. Практические сценарии использования**

### **Сценарий 1: Быстрая задача (однофайловая)**

```markdown
📎 Только cursor rules (пассивно)
💬 "Добавь валидацию в форму компонента"
```

### **Сценарий 2: Средняя задача (рефакторинг)**

```markdown
📎 @architectural-guide.mdc + текущие файлы
💬 "Приведи к стандарту mongoose-paginate-v2"
```

### **Сценарий 3: Сложная задача (архитектурная)**

```markdown
📎 @multi-agent-workflow.mdc @architectural-guide.mdc + файлы
💬 "Унификация поиска: backend + frontend изменения"
```

## **7. Мониторинг эффективности**

**Отслеживайте метрики:**

```javascript
const cursorEfficiency = {
  regressionRate: "Число багов после изменений",
  timeToImplement: "Время выполнения задач", 
  patternAdherence: "Следование архитектурным паттернам",
  contextRelevance: "Релевантность прикрепленного контекста"
}
```

## **🚀 Рекомендуемый workflow:**

1. **Всегда начинайте с cursor rules** (пассивный режим)
2. **Прикрепляйте специфичные гайды** только для сложных задач
3. **Добавляйте файлы кода** для контекста
4. **Используйте конкретные промпты** со ссылками на паттерны
5. **Валидируйте результат** по метрикам из general-rules

**Готов применить этот подход на практике? Начнем с унификации поиска Athletes?** 🎯

ОСНОВНЫЕ АРХИТЕКТУРНЫЕ ШАБЛОНЫ И ДЕРЕВА РЕШЕНИЙ
