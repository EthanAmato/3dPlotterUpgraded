"use client";
import {
  Dispatch,
  SetStateAction,
  useState,
  useEffect,
  FormEvent,
} from "react";
import { z } from "zod";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "../button";

type SpreadsheetDialogProps = {
  file: File;
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
};

type Axes = {
  x: string;
  y: string;
  z: string;
};
type Axis = keyof Axes;

// Import necessary hooks and components
import readXlsxFile from "read-excel-file";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../select";
import { Input } from "../input";
import { Controller, Form, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const dialogFormSchema = z.object({
  title: z.string().min(1, "Graph title is required"),
  x: z.string().min(1, "X axis selection is required"),
  y: z.string().min(1, "Y axis selection is required"),
  z: z.string().min(1, "Z axis selection is required"),
  colorBy: z.string().optional(), // Make 'color by' optional
});

const SpreadsheetDialog = ({
  file,
  isOpen,
  setIsOpen,
}: SpreadsheetDialogProps) => {
  const [columnNames, setColumnNames] = useState<string[]>([]);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(dialogFormSchema),
    defaultValues: {
      title: "",
      x: "",
      y: "",
      z: "",
      colorBy: "",
    },
  });

  useEffect(() => {
    readXlsxFile(file).then((rows) => {
      const headers = rows[0] as string[];
      setColumnNames(headers);
    });
  }, [file]);

  const onSubmit = (data: any) => {
    console.log(data);
    setIsOpen(false);
    // Handle the submission logic here
  };
  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Customize your Graph!</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogDescription asChild>
          <>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
              <div>
                <Controller
                  name="title"
                  control={control}
                  render={({ field }) => {
                    console.log(field);
                    field.ref = null;
                    return <Input {...field} />;
                  }}
                />
                {/* Check if the error message is defined before rendering */}
                {/* {errors.title?.message && (
                  <p className="text-red-600">{errors.title.message}</p>
                )} */}
              </div>

              <div>
                {(["x", "y", "z"] as const).map((axis) => (
                  <div key={axis}>
                    <Controller
                      name={axis}
                      control={control}
                      render={({ field }) => {
                        field.ref = null;
                        return (
                          <>
                            <Select {...field} onValueChange={field.onChange}>
                              <SelectTrigger>
                                <SelectValue
                                  placeholder={`Select ${axis.toUpperCase()} axis`}
                                />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  <SelectLabel>Columns</SelectLabel>
                                  {columnNames.map((name, index) => (
                                    <SelectItem key={index} value={name}>
                                      {name}
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                            {/* Display the error message if there's an error for this field */}
                            {errors[axis] && (
                              <p className="text-red-600">
                                {errors[axis]?.message && (
                                  <p className="text-red-600">
                                    {errors[axis]?.message as string}
                                  </p>
                                )}{" "}
                              </p>
                            )}
                          </>
                        );
                      }}
                    />
                  </div>
                ))}
              </div>

              <Controller
                name="colorBy"
                control={control}
                render={({ field }) => {
                  field.ref = null;
                  return (
                    <Select {...field} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select column to color by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Columns</SelectLabel>
                          {columnNames.map((name, index) => (
                            <SelectItem key={index} value={name}>
                              {name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  );
                }}
              />

              <Button type="submit">Submit</Button>
            </form>
          </>
        </AlertDialogDescription>
        <AlertDialogFooter>
          <Button onClick={() => setIsOpen(false)}>Close</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default SpreadsheetDialog;
