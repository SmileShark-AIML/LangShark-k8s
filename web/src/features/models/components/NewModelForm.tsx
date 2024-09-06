import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { DatePicker } from "@/src/components/date-picker";
import Header from "@/src/components/layouts/header";
import { Button } from "@/src/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { ModelUsageUnit } from "@langfuse/shared";
import { AutoComplete } from "@/src/features/prompts/components/auto-complete";
import { api } from "@/src/utils/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { JsonEditor } from "@/src/components/json-editor";
import { usePostHogClientCapture } from "@/src/features/posthog-analytics/usePostHogClientCapture";
import Link from "next/link";
import { utcDate } from "@/src/utils/dates";

const formSchema = z.object({
  modelName: z.string().min(1),
  matchPattern: z.string(),
  startDate: z.date().optional(),
  inputPrice: z
    .string()
    .refine((value) => value === "" || isFinite(parseFloat(value)), {
      message: "Price needs to be numeric",
    })
    .optional(),
  outputPrice: z
    .string()
    .refine((value) => value === "" || isFinite(parseFloat(value)), {
      message: "Price needs to be numeric",
    })
    .optional(),
  totalPrice: z
    .string()
    .refine((value) => value === "" || isFinite(parseFloat(value)), {
      message: "Price needs to be numeric",
    })
    .optional(),
  unit: z.nativeEnum(ModelUsageUnit),
  tokenizerId: z.enum(["openai", "claude", "None"]),
  tokenizerConfig: z.string().refine(
    (value) => {
      try {
        JSON.parse(value);
        return true;
      } catch (e) {
        return false;
      }
    },
    {
      message: "Tokenizer config needs to be valid JSON",
    },
  ),
});

export const NewModelForm = (props: {
  projectId: string;
  onFormSuccess?: () => void;
}) => {
  const [formError, setFormError] = useState<string | null>(null);
  const capture = usePostHogClientCapture();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      modelName: "",
      matchPattern: "",
      startDate: undefined,
      inputPrice: "",
      outputPrice: "",
      totalPrice: "",
      unit: ModelUsageUnit.Tokens,
      tokenizerId: "None",
      tokenizerConfig: "{}",
    },
  });

  const utils = api.useUtils();
  const createModelMutation = api.models.create.useMutation({
    onSuccess: () => utils.models.invalidate(),
    onError: (error) => setFormError(error.message),
  });

  const modelNames = api.models.modelNames.useQuery({
    projectId: props.projectId,
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    capture("models:new_form_submit");
    createModelMutation
      .mutateAsync({
        projectId: props.projectId,
        modelName: values.modelName,
        matchPattern: values.matchPattern,
        inputPrice: !!values.inputPrice
          ? parseFloat(values.inputPrice)
          : undefined,
        outputPrice: !!values.outputPrice
          ? parseFloat(values.outputPrice)
          : undefined,
        totalPrice: !!values.totalPrice
          ? parseFloat(values.totalPrice)
          : undefined,
        unit: values.unit,
        tokenizerId:
          values.tokenizerId === "None" ? undefined : values.tokenizerId,
        tokenizerConfig:
          values.tokenizerConfig &&
          typeof JSON.parse(values.tokenizerConfig) === "object"
            ? (JSON.parse(values.tokenizerConfig) as Record<string, number>)
            : undefined,
        startDate: values.startDate ? utcDate(values.startDate) : undefined,
      })
      .then(() => {
        props.onFormSuccess?.();
        form.reset();
      })
      .catch((error) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if ("message" in error && typeof error.message === "string") {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          setFormError(error.message as string);
          return;
        } else {
          setFormError(JSON.stringify(error));
          console.error(error);
        }
      });
  }

  return (
    <Form {...form}>
      <form
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-2"
      >
        <Header level="h3" title="이름" />
        <FormField
          control={form.control}
          name="modelName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>모델 이름</FormLabel>
              <FormControl>
                <AutoComplete
                  {...field}
                  options={
                    modelNames.data?.map((model) => ({
                      value: model,
                      label: model,
                    })) ?? []
                  }
                  placeholder=""
                  onValueChange={(option) => field.onChange(option.value)}
                  value={{ value: field.value, label: field.value }}
                  disabled={false}
                  createLabel="새로운 커스텀 모델이름 입력"
                />
              </FormControl>
              <FormDescription>
              모델의 이름입니다. API에서 모델을 참조하는 데 사용됩니다. 동일한 이름과 일치 패턴을 사용하여 모델의 가격 변동을 추적할 수 있습니다. 동일한 이름과 일치 패턴을 사용하여 모델의 가격 변동을 추적할 수 있습니다.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Header level="h3" title="스코프" className="mt-3" />
        <FormField
          control={form.control}
          name="matchPattern"
          render={({ field }) => (
            <FormItem>
              <FormLabel>매치 패턴</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>
              수집된 세대(모델 속성)를 이 모델 정의와 일치시키는 정규식(Postgres 구문)입니다. 대소문자를 구분하지 않고 모델 이름과 정확히 일치시키려면 (?i)^(modelname)$ 표현식을 사용합니다.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="startDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>시작 시간 (UTC)</FormLabel>
              <FormControl>
                <DatePicker
                  date={field.value}
                  onChange={(date) => field.onChange(date)}
                  clearable
                />
              </FormControl>
              <FormDescription>
              설정하면 이 날짜 이후의 세대에만 모델이 사용됩니다.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Header level="h3" title="가격" className="mt-3" />
        <FormField
          control={form.control}
          name="unit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>유닛</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a unit" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(ModelUsageUnit).map((unit) => (
                    <SelectItem value={unit} key={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
              모델의 측정 단위입니다.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-3 gap-2">
          <FormField
            control={form.control}
            name="inputPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Input 가격 (USD per{" "}
                  {form.getValues("unit").toLowerCase().replace(/s$/, "")})
                </FormLabel>
                <FormControl>
                  <Input {...field} type="number" />
                </FormControl>
                {field.value !== null && field.value !== "" ? (
                  <FormDescription>
                    <ul className="font-mono text-xs">
                      <li>
                        {(parseFloat(field.value ?? "0") * 1000).toFixed(8)} USD
                        / 1k {form.getValues("unit").toLowerCase()}
                      </li>
                      <li>
                        {(parseFloat(field.value ?? "0") * 100_000).toFixed(8)}{" "}
                        USD / 100k {form.getValues("unit").toLowerCase()}
                      </li>
                      <li>
                        {(parseFloat(field.value ?? "0") * 1_000_000).toFixed(
                          8,
                        )}{" "}
                        USD / 1M {form.getValues("unit").toLowerCase()}
                      </li>
                    </ul>
                  </FormDescription>
                ) : null}
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="outputPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Output 가격 (USD per{" "}
                  {form.getValues("unit").toLowerCase().replace(/s$/, "")})
                </FormLabel>
                <FormControl>
                  <Input {...field} type="number" />
                </FormControl>
                {field.value !== null && field.value !== "" ? (
                  <FormDescription>
                    <ul className="font-mono text-xs">
                      <li>
                        {(parseFloat(field.value ?? "0") * 1000).toFixed(8)} USD
                        / 1k {form.getValues("unit").toLowerCase()}
                      </li>
                      <li>
                        {(parseFloat(field.value ?? "0") * 100_000).toFixed(8)}{" "}
                        USD / 100k {form.getValues("unit").toLowerCase()}
                      </li>
                      <li>
                        {(parseFloat(field.value ?? "0") * 1_000_000).toFixed(
                          8,
                        )}{" "}
                        USD / 1M {form.getValues("unit").toLowerCase()}
                      </li>
                    </ul>
                  </FormDescription>
                ) : null}
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="totalPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  총 가격 (USD per{" "}
                  {form.getValues("unit").toLowerCase().replace(/s$/, "")})
                </FormLabel>
                <FormControl>
                  <Input {...field} type="number" />
                </FormControl>
                <FormDescription>
                  {field.value !== null && field.value !== "" ? (
                    <ul className="mt-2 font-mono text-xs">
                      <li>
                        {(parseFloat(field.value ?? "0") * 1000).toFixed(8)} USD
                        / 1k {form.getValues("unit").toLowerCase()}
                      </li>
                      <li>
                        {(parseFloat(field.value ?? "0") * 100_000).toFixed(8)}{" "}
                        USD / 100k {form.getValues("unit").toLowerCase()}
                      </li>
                      <li>
                        {(parseFloat(field.value ?? "0") * 1_000_000).toFixed(
                          8,
                        )}{" "}
                        USD / 1M {form.getValues("unit").toLowerCase()}
                      </li>
                    </ul>
                  ) : (
                    "별도의 입력 및 출력 가격이 제공되지 않은 경우에만 총 가격을 입력합니다."
                  )}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Header level="h3" title="토큰화" className="mt-3" />
        <FormField
          control={form.control}
          name="tokenizerId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>토크나이저</FormLabel>
              <Select
                onValueChange={(tokenizerId) => {
                  field.onChange(tokenizerId);
                  if (tokenizerId === "None") {
                    form.setValue("tokenizerConfig", "{}");
                  }
                }}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a unit" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {["openai", "claude", "None"].map((unit) => (
                    <SelectItem value={unit} key={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {/* <FormDescription>
                Optionally, Langfuse can tokenize the input and output of a
                generation if no unit counts are ingested. This is useful for
                e.g. streamed OpenAI completions. For details on the supported
                tokenizers, see the{" "}
                <Link
                  href="https://langfuse.com/docs/model-usage-and-cost"
                  className="underline"
                  target="_blank"
                >
                  docs
                </Link>
                .
              </FormDescription> */}
              <FormMessage />
            </FormItem>
          )}
        />
        {form.watch("tokenizerId") !== "None" && (
          <FormField
            control={form.control}
            name="tokenizerConfig"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tokenizer Config</FormLabel>
                <JsonEditor
                  defaultValue={field.value}
                  onChange={field.onChange}
                />
                {/* <FormDescription>
                  The config for the tokenizer. Required for openai. See the{" "}
                  <Link
                    href="https://langfuse.com/docs/model-usage-and-cost"
                    className="underline"
                    target="_blank"
                  >
                    docs
                  </Link>{" "}
                  for details.
                </FormDescription> */}
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <Button
          type="submit"
          loading={createModelMutation.isLoading}
          className="mt-6"
        >
          저장
        </Button>
      </form>
      {formError ? (
        <p className="text-red text-center">
          <span className="font-bold">Error:</span> {formError}
        </p>
      ) : null}
    </Form>
  );
};
