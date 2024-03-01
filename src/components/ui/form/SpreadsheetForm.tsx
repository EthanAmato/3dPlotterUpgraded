"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState } from "react";

import SpreadsheetDialog, { DialogFormSchema } from "./SpreadsheetDialog";

const ACCEPTED_IMAGE_TYPES = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];
const formSchema = z.object({
  file: z
    .instanceof(File)
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Only .xlsx files are allowed."
    ),
});
export function SpreadSheetForm() {
  const [isFormSubmitted, setIsFormSubmitted] = useState<boolean>(false);
  const [spreadsheetFile, setSpreadsheetFile] = useState<File | null>(null);
  const [fileMetadata, setFileMetadata] = useState<DialogFormSchema | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  function onSubmit(value: z.infer<typeof formSchema>) {
    setIsFormSubmitted(true);
    setSpreadsheetFile(value.file);
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="file"
            render={({ field: { onChange, ...field } }) => (
              <FormItem>
                <FormLabel>Spreadsheet</FormLabel>
                <FormControl>
                  {/* Manually handle the onChange event */}
                  <Input
                    type="file"
                    onChange={(e) => {
                      const files = e.target.files;
                      const file = files && files[0] ? files[0] : null;
                      if (file) {
                        onChange(file); // Update the form state with the single file
                      }
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Please upload your .XLSX file...
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Submit</Button>
        </form>
      </Form>
      {isFormSubmitted && (
        <SpreadsheetDialog
          file={spreadsheetFile!}
          isOpen={isFormSubmitted}
          setIsOpen={setIsFormSubmitted}
          setFileMetadata={setFileMetadata!}
        />
      )}
    </>
  );
}
