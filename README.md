# gulp-i18n-swig

A gulp module to manage translation with swig templates.

## locales

You need a JSON locales file.

```
{
  "en": {
    "language": "Language",
    "english": "English",
    "french": "French"
  },
  "fr": {
    "language": "Langue",
    "english": "Anglais",
    "french": "Français"
  },
  "jp": {
    "language": "言語",
    "english": "英語",
    "french": "フランス語"
  }
}
```

## gulp and stuff

- `gulp clean`: deletes the test output folder.
- `gulp lint`: validates js code.
- `gulp test`: executes tests (also calls `gulp clean`)
- `gulp` (default task): runs all the things !
