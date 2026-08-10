{{/*
Expand the name of the chart.
*/}}
{{- define "food-delivery.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "food-delivery.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "food-delivery.labels" -}}
helm.sh/chart: {{ include "food-delivery.chart" . }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}
