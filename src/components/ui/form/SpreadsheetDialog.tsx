"use client";
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
import { Controller, FieldPath, FieldValues, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dispatch,
  SetStateAction,
  useState,
  useEffect,
  RefCallback,
} from "react";
import { z } from "zod";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "../button";
import { Label } from "@radix-ui/react-label";
import { Checkbox } from "../checkbox";

type SpreadsheetDialogProps = {
  file: File;
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  setFileMetadata: Dispatch<SetStateAction<DialogFormSchema | null>>;
};

type Axes = {
  x: string;
  y: string;
  z: string;
};
type Axis = keyof Axes;

const dialogFormSchema = z.object({
  title: z.string().min(1, "Graph title is required"),
  x: z.string().min(1, "X axis selection is required"),
  y: z.string().min(1, "Y axis selection is required"),
  z: z.string().min(1, "Z axis selection is required"),
  height: z.number(),
  width: z.number(),
  pointNames: z.string(),
  displayNamesTrue: z.boolean(),
  pointDescriptions: z.string().optional(),
  colorBy: z.string().optional(), // Make 'color by' optional
});

export type DialogFormSchema = z.infer<typeof dialogFormSchema>;

const SpreadsheetDialog = ({
  file,
  isOpen,
  setIsOpen,
  setFileMetadata,
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
      width: 800,
      height: 600,
      colorBy: "",
      pointNames: "",
      displayNamesTrue: false,
      pointDescriptions: "",
    },
  });

  useEffect(() => {
    readXlsxFile(file).then((rows) => {
      const headers = rows[0] as string[];
      setColumnNames(headers);
    });
  }, [file]);

  const onSubmit = (data: DialogFormSchema) => {
    console.log(data);
    setFileMetadata(data);
    setIsOpen(false);
  };
  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Customize your Graph!</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogDescription asChild>
          <>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
            >
              <div>
                <Controller
                  name="title"
                  control={control}
                  render={({ field }) => {
                    // field.ref = null;
                    return (
                      <>
                        <Label htmlFor="title">Title</Label>
                        <Input
                          id="title"
                          placeholder="Graph Title"
                          {...field}
                        />
                      </>
                    );
                  }}
                />
              </div>
              <div className="flex">
                <div>
                  <Label htmlFor="width">Width</Label>
                  <Controller
                    name="width"
                    control={control}
                    render={({ field }) => {
                      // field.ref = null;
                      return (
                        <>
                          <Input
                            id="width"
                            type="number"
                            placeholder="Width"
                            {...field}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === ""
                                  ? ""
                                  : Number(e.target.value)
                              )
                            } // Convert the input value to a number
                          />
                        </>
                      );
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="height">Height</Label>

                  <Controller
                    name="height"
                    control={control}
                    render={({ field }) => {
                      // field.ref = null;
                      return (
                        <Input
                          id="height"
                          type="number"
                          placeholder="Height"
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ""
                                ? ""
                                : Number(e.target.value)
                            )
                          } // Convert the input value to a number
                        />
                      );
                    }}
                  />
                </div>
              </div>
              <div>
                <Label>Axes</Label>

                {(["x", "y", "z"] as const).map((axis) => (
                  <div key={axis}>
                    <Controller
                      name={axis}
                      control={control}
                      render={({ field }) => {
                        // field.ref = null;
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
              <div className="flex md:flex-row flex-col">
                <div className="flex flex-col flex-1">
                  <Label htmlFor="pointNames">Point Labels</Label>
                  <Controller
                    name="pointNames"
                    control={control}
                    render={({ field }) => {
                      // field.ref = null;
                      return (
                        <Select {...field} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select column to name by" />
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
                          {errors && (
                            <p className="text-red-600">
                              {errors?.pointNames?.message && (
                                <p className="text-red-600">
                                  {errors?.pointNames.message as string}
                                </p>
                              )}
                            </p>
                          )}
                        </Select>
                      );
                    }}
                  />
                </div>
                <div className="flex flex-col  items-center">
                  <Label htmlFor="displayNamesTrue" className="text-center">
                    Display Marker Text
                  </Label>
                  <div className="flex items-center h-full">
                    <Controller
                      name="displayNamesTrue"
                      control={control}
                      render={({ field }) => {
                        return (
                          <Checkbox
                            id="displayNamesTrue"
                            checked={field.value} // Control the checked state
                            onClick={(e) => {
                              console.log("inside");
                              return field.onChange(!field.value);
                            }} // Update form value on change with type assertion
                            ref={field.ref} // Optional: for react-hook-form to register and manage focus, etc.
                          />
                        );
                      }}
                    />
                  </div>
                </div>
              </div>
              <div>
                <Label>Point Descriptions</Label>
                <Controller
                  name="pointDescriptions"
                  control={control}
                  render={({ field }) => {
                    // field.ref = null;
                    return (
                      <Select {...field} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Optionally select a column for descriptions" />
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
              </div>
              <div>
                <Label>Color By:</Label>

                <Controller
                  name="colorBy"
                  control={control}
                  render={({ field }) => {
                    // field.ref = null;
                    return (
                      <Select {...field} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Optionally select column to color by" />
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
              </div>

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
