"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface JsonSchemaProperty {
  type?: "string" | "number" | "integer" | "boolean";
  enum?: string[];
  format?: string;
  description?: string;
  title?: string;
}

interface JsonSchema {
  type?: "object";
  properties?: Record<string, JsonSchemaProperty>;
  required?: string[];
}

interface Props {
  schema: JsonSchema;
  message?: string;
  onSubmit: (values: Record<string, unknown>) => void;
  onCancel: () => void;
}

/**
 * Renders a tiny form from a JSON Schema for MCP elicitation. Supports text /
 * email / select inputs — enough for portfolio booking flows. Required fields
 * use HTML5 validation.
 */
export function ElicitationForm({ schema, message, onSubmit, onCancel }: Props) {
  const props = schema.properties ?? {};
  const required = new Set(schema.required ?? []);
  const [values, setValues] = useState<Record<string, string>>({});

  const handle = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(values);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>More info needed</CardTitle>
        {message ? (
          <p className="text-sm text-muted-foreground">{message}</p>
        ) : null}
      </CardHeader>
      <CardContent>
        <form onSubmit={handle} className="space-y-3">
          {Object.entries(props).map(([name, prop]) => (
            <Field
              key={name}
              name={name}
              prop={prop}
              required={required.has(name)}
              value={values[name] ?? ""}
              onChange={(v) => setValues((s) => ({ ...s, [name]: v }))}
            />
          ))}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">Submit</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function Field({
  name,
  prop,
  required,
  value,
  onChange,
}: {
  name: string;
  prop: JsonSchemaProperty;
  required: boolean;
  value: string;
  onChange: (v: string) => void;
}) {
  const label = prop.title ?? name;
  if (prop.enum && prop.enum.length > 0) {
    return (
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">
          {label}
          {required ? " *" : ""}
        </span>
        <select
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="" disabled>
            Select…
          </option>
          {prop.enum.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </label>
    );
  }
  const inputType = prop.format === "email" ? "email" : "text";
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium">
        {label}
        {required ? " *" : ""}
      </span>
      <Input
        type={inputType}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={prop.description}
      />
    </label>
  );
}
