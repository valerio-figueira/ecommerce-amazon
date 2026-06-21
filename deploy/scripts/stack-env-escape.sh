#!/usr/bin/env bash
# Escapa valores para scalar YAML entre aspas duplas (docker stack environment).

yaml_double_quote() {
  local value="$1"
  value="${value//\\/\\\\}"
  value="${value//\"/\\\"}"
  value="${value//$'\n'/\\n}"
  value="${value//$'\r'/\\r}"
  printf '"%s"' "${value}"
}

export_stack_yaml_secrets() {
  export PASSWORD_PEPPER_YAML
  export JWT_SECRET_YAML
  export POSTGRES_PASSWORD_YAML
  export POSTGRES_USER_YAML
  export POSTGRES_DB_YAML
  export DATABASE_URL_YAML
  export REDIS_URL_YAML
  export ENCRYPTION_KEY_YAML
  export REVALIDATE_SECRET_YAML
  export RESEND_API_KEY_YAML
  export GA4_SERVICE_ACCOUNT_JSON_YAML
  export CORS_ORIGINS_YAML
  export API_INTERNAL_URL_YAML
  export JWT_EXPIRES_IN_YAML

  PASSWORD_PEPPER_YAML="$(yaml_double_quote "${PASSWORD_PEPPER}")"
  JWT_SECRET_YAML="$(yaml_double_quote "${JWT_SECRET}")"
  POSTGRES_PASSWORD_YAML="$(yaml_double_quote "${POSTGRES_PASSWORD}")"
  POSTGRES_USER_YAML="$(yaml_double_quote "${POSTGRES_USER}")"
  POSTGRES_DB_YAML="$(yaml_double_quote "${POSTGRES_DB}")"
  DATABASE_URL_YAML="$(yaml_double_quote "${DATABASE_URL}")"
  REDIS_URL_YAML="$(yaml_double_quote "${REDIS_URL}")"
  ENCRYPTION_KEY_YAML="$(yaml_double_quote "${ENCRYPTION_KEY}")"
  REVALIDATE_SECRET_YAML="$(yaml_double_quote "${REVALIDATE_SECRET}")"
  RESEND_API_KEY_YAML="$(yaml_double_quote "${RESEND_API_KEY}")"
  GA4_SERVICE_ACCOUNT_JSON_YAML="$(yaml_double_quote "${GA4_SERVICE_ACCOUNT_JSON:-}")"
  CORS_ORIGINS_YAML="$(yaml_double_quote "${CORS_ORIGINS}")"
  STORAGE_PUBLIC_BASE_URL_YAML="$(yaml_double_quote "${STORAGE_PUBLIC_BASE_URL}")"
  WEB_PUBLIC_URL_YAML="$(yaml_double_quote "${WEB_PUBLIC_URL}")"
  SITE_NAME_YAML="$(yaml_double_quote "${SITE_NAME}")"
  COMPANY_LEGAL_NAME_YAML="$(yaml_double_quote "${COMPANY_LEGAL_NAME}")"
  CONTACT_EMAIL_YAML="$(yaml_double_quote "${CONTACT_EMAIL}")"
  SITE_TAGLINE_YAML="$(yaml_double_quote "${SITE_TAGLINE}")"
  AMAZON_AFFILIATE_TAG_YAML="$(yaml_double_quote "${AMAZON_AFFILIATE_TAG}")"
  SHOPEE_AFFILIATE_ID_YAML="$(yaml_double_quote "${SHOPEE_AFFILIATE_ID}")"
  EMAIL_FROM_YAML="$(yaml_double_quote "${EMAIL_FROM}")"
  API_INTERNAL_URL_YAML="$(yaml_double_quote "${API_INTERNAL_URL}")"
  JWT_EXPIRES_IN_YAML="$(yaml_double_quote "${JWT_EXPIRES_IN}")"
}
