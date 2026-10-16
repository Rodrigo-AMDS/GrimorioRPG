"use client";

import { useMemo, useState } from "react";

export type FeatureDraft = { name: string; description: string; source: string; uses: number | null; maxUses: number | null };
const blank = (): FeatureDraft => ({ name: "", description: "", source: "", uses: null, maxUses: null });

export function FeatureEditor({ initialFeatures }: { initialFeatures: FeatureDraft[] }) {
  const [features, setFeatures] = useState<FeatureDraft[]>(initialFeatures.length ? initialFeatures : [blank()]);
  const payload = useMemo(() => JSON.stringify(features), [features]);
  const update = (index: number, key: keyof FeatureDraft, value: string | number | null) => setFeatures((current) => current.map((feature, itemIndex) => itemIndex === index ? { ...feature, [key]: value } : feature));
  const numberValue = (value: string) => value === "" ? null : Number(value);
  return <section className="feature-editor"><input type="hidden" name="featuresJson" value={payload} /><div className="feature-editor-heading"><div><h2>Habilidades</h2><p>Descreva cada habilidade e seus recursos de uso.</p></div><button className="button secondary" type="button" onClick={() => setFeatures((current) => [...current, blank()])}>ADICIONAR HABILIDADE</button></div>{features.map((feature, index) => <article className="feature-card" key={index}><div className="feature-card-heading"><b>Habilidade {index + 1}</b>{features.length > 1 && <button type="button" className="text-button" onClick={() => setFeatures((current) => current.filter((_, itemIndex) => itemIndex !== index))}>REMOVER</button>}</div><div className="form-grid"><label>Nome<input value={feature.name} onChange={(event) => update(index, "name", event.target.value)} maxLength={160} /></label><label>Origem<input value={feature.source} onChange={(event) => update(index, "source", event.target.value)} maxLength={160} placeholder="Classe, espécie, item..." /></label></div><label>Descrição<textarea value={feature.description} onChange={(event) => update(index, "description", event.target.value)} rows={4} maxLength={4000} placeholder="Efeito, condições, alcance e observações do Mestre." /></label><div className="resource-fields"><label>Usos atuais<input value={feature.uses ?? ""} onChange={(event) => update(index, "uses", numberValue(event.target.value))} type="number" min="0" max="999" /></label><label>Máximo de usos<input value={feature.maxUses ?? ""} onChange={(event) => update(index, "maxUses", numberValue(event.target.value))} type="number" min="0" max="999" /></label></div></article>)}</section>;
}
