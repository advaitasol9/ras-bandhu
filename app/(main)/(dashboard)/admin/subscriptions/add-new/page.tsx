"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useFirestore } from "reactfire";
import { doc, setDoc, updateDoc, collection, getDoc } from "firebase/firestore";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plan } from "@/lib/types";
import { toast } from "@/components/ui/use-toast";

const PlanForm: React.FC = () => {
  const router = useRouter();
  const firestore = useFirestore();
  const searchParams = useSearchParams();
  const id = searchParams ? searchParams.get("id") : "";

  const [planData, setPlanData] = useState<Plan>({
    id: "",
    name: "",
    duration: 0,
    features: [],
    price: 0,
    discountedPrice: 0,
    isVisible: false,
    openForAdmission: false,
    seatsLeft: 0,
    parentSection: "",
    medium: "",
    isTrial: false,
    creditsPerDay: 0, // For dailyEvaluation
    totalCredits: 0, // For testEvaluation
    admissions: 0,
    revenue: 0,
  });
  const [newFeature, setNewFeature] = useState<string>("");
  const [hasDiscount, setHasDiscount] = useState<boolean>(false);
  const [editFeatureIndex, setEditFeatureIndex] = useState<number | null>(null);
  const [editedFeature, setEditedFeature] = useState<string>("");

  useEffect(() => {
    const fetchPlan = async () => {
      if (id) {
        const planDocRef = doc(firestore, "SubscriptionPlans", id as string);
        const planSnapshot = await getDoc(planDocRef);
        if (planSnapshot.exists()) {
          const data = planSnapshot.data() as Plan;
          setPlanData({ ...data, id });
          setHasDiscount(data.discountedPrice != data.price);
        }
      }
    };

    fetchPlan();
  }, [id, firestore]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Convert fields that should be numbers
    const numericFields = [
      "duration",
      "price",
      "discountedPrice",
      "seatsLeft",
      "creditsPerDay",
      "totalCredits",
    ];

    const fieldValue = numericFields.includes(name) ? Number(value) : value;

    setPlanData((prevData) => ({ ...prevData, [name]: fieldValue }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPlanData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSwitchChange = (fieldName: keyof Plan) => {
    setPlanData((prevData) => ({
      ...prevData,
      [fieldName]: !prevData[fieldName],
    }));
  };

  const handleFeatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewFeature(e.target.value);
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setPlanData((prevData) => ({
        ...prevData,
        features: [...prevData.features, newFeature],
      }));
      setNewFeature(""); // Clear input
    }
  };

  const removeFeature = (index: number) => {
    setPlanData((prevData) => ({
      ...prevData,
      features: prevData.features.filter((_, i) => i !== index),
    }));
  };

  const handleEditFeature = (index: number) => {
    setEditFeatureIndex(index);
    setEditedFeature(planData.features[index]); // Set current value for editing
  };

  const handleSaveFeature = (index: number) => {
    const updatedFeatures = [...planData.features];
    updatedFeatures[index] = editedFeature; // Update the specific feature
    setPlanData((prevData) => ({
      ...prevData,
      features: updatedFeatures,
    }));
    setEditFeatureIndex(null); // Exit edit mode
    setEditedFeature(""); // Clear the edited feature
  };

  const handleCancelEdit = () => {
    setEditFeatureIndex(null);
    setEditedFeature("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const planRef = id
        ? doc(firestore, "SubscriptionPlans", id)
        : doc(collection(firestore, "SubscriptionPlans"));

      const discountedPrice = hasDiscount
        ? planData.discountedPrice
        : planData.price;

      if (id) {
        await updateDoc(planRef, { ...planData, discountedPrice, id });
      } else {
        await setDoc(planRef, { ...planData, discountedPrice, id: planRef.id });
      }
      toast({
        title: "Success",
        description: "Plan saved",
        variant: "success",
      });
      router.replace("/admin/subscriptions");
    } catch (error) {
      console.error("Error saving plan: ", error);
    }
  };

  return (
    <div className="container mx-auto mt-12 max-w-lg bg-card p-8 rounded-lg shadow-lg transition-transform hover:scale-105">
      <h1 className="text-3xl font-semibold mb-8 text-primary-text text-center">
        {id ? "Edit" : "Create"} Plan
      </h1>
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Plan Name */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-primary-text">
            Plan Name
          </label>
          <Input
            name="name"
            value={planData.name}
            onChange={handleInputChange}
            placeholder="Plan Name"
            className="w-full text-input-text placeholder-muted-foreground border-input rounded-md shadow-md"
          />
        </div>

        {/* Duration */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-primary-text">
            Duration (days)
          </label>
          <Input
            name="duration"
            type="number"
            value={planData.duration}
            onChange={handleInputChange}
            placeholder="Duration"
            className="w-full text-input-text placeholder-muted-foreground border-input rounded-md shadow-md"
          />
        </div>

        {/* Price */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-primary-text">
            Price (INR)
          </label>
          <Input
            name="price"
            type="number"
            value={planData.price}
            onChange={handleInputChange}
            placeholder="Price"
            className="w-full text-input-text placeholder-muted-foreground border-input rounded-md shadow-md"
          />
        </div>

        {/* Discount Toggle */}
        <div className="flex items-center space-x-4">
          <label className="text-primary-text">Discount</label>
          <Switch
            checked={hasDiscount}
            onChange={() => setHasDiscount(!hasDiscount)}
            className={`${
              hasDiscount ? "bg-primary" : "bg-card"
            } rounded-full shadow-inner`}
          />
        </div>

        {/* Discounted Price */}
        {hasDiscount && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-primary-text">
              Discounted Price (INR)
            </label>
            <Input
              name="discountedPrice"
              type="number"
              value={planData.discountedPrice}
              onChange={handleInputChange}
              placeholder="Discounted Price"
              className="w-full text-input-text placeholder-muted-foreground border-input rounded-md shadow-md"
            />
          </div>
        )}

        {/* Seats Left */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-primary-text">
            Seats Left
          </label>
          <Input
            name="seatsLeft"
            type="number"
            value={planData.seatsLeft}
            onChange={handleInputChange}
            placeholder="Seats Left"
            className="w-full text-input-text placeholder-muted-foreground border-input rounded-md shadow-md"
          />
        </div>

        {/* Medium Section */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-primary-text">
            Medium
          </label>
          <select
            name="medium"
            value={planData.medium}
            onChange={handleSelectChange}
            className="w-full p-2 border-input rounded-md bg-background text-primary-text shadow-md"
          >
            <option value="">Select Medium</option>
            <option value="hindi">Hindi</option>
            <option value="english">English</option>
          </select>
        </div>

        {/* Parent Section */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-primary-text">
            Parent Section
          </label>
          <select
            name="parentSection"
            value={planData.parentSection}
            onChange={handleSelectChange}
            className="w-full p-2 border-input rounded-md bg-background text-primary-text shadow-md"
          >
            <option value="">Select Section</option>
            <option value="dailyEvaluation">Daily Evaluation</option>
            <option value="testEvaluation">Test Evaluation</option>
            <option value="testSeries">Test Series</option>
          </select>
        </div>

        {/* Conditional Credits Fields */}
        {planData.parentSection === "dailyEvaluation" && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-primary-text">
              Credits Per Day
            </label>
            <Input
              name="creditsPerDay"
              type="number"
              value={planData.creditsPerDay}
              onChange={handleInputChange}
              placeholder="Credits Per Day"
              className="w-full text-input-text placeholder-muted-foreground border-input rounded-md shadow-md"
            />
          </div>
        )}
        {planData.parentSection === "testEvaluation" && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-primary-text">
              Total Credits
            </label>
            <Input
              name="totalCredits"
              type="number"
              value={planData.totalCredits}
              onChange={handleInputChange}
              placeholder="Total Credits"
              className="w-full text-primary-text placeholder-muted-foreground border-input rounded-md shadow-md"
            />
          </div>
        )}

        {/* Features */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-primary-text">
            Features
          </label>
          <div className="space-y-2">
            {planData.features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-2">
                {editFeatureIndex === index ? (
                  <>
                    <Input
                      value={editedFeature}
                      onChange={(e) => setEditedFeature(e.target.value)}
                      className="text-input-text placeholder-muted-foreground border-input rounded-md shadow-md"
                    />
                    <Button
                      type="button"
                      onClick={() => handleSaveFeature(index)}
                      className="bg-primary text-button-text hover:bg-primary-foreground"
                    >
                      Save
                    </Button>
                    <Button
                      type="button"
                      onClick={handleCancelEdit}
                      className="bg-destructive text-button-text hover:bg-destructive-foreground"
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <span className="text-primary-text">{feature}</span>
                    <Button
                      type="button"
                      onClick={() => handleEditFeature(index)}
                      className="bg-[rgb(var(--edit))] text-button-text hover:bg-[rgb(var(--secondary-foreground))]"
                    >
                      Edit
                    </Button>
                    <Button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="bg-destructive text-button-text hover:text-[rgb(var(--button-text-foreground))] hover:bg-destructive-foreground"
                    >
                      &times;
                    </Button>
                  </>
                )}
              </div>
            ))}

            {/* Input to add new feature */}
            <div className="flex items-center space-x-2">
              <Input
                value={newFeature}
                onChange={handleFeatureChange}
                placeholder="Add a new feature"
                className="w-full text-input-text placeholder-muted-foreground border-input rounded-md shadow-md"
              />
              <Button
                type="button"
                className="bg-primary text-button-text hover:bg-primary-foreground"
                onClick={addFeature}
              >
                Add
              </Button>
            </div>
          </div>
        </div>

        {/* Switches */}
        <div className="flex items-center space-x-4">
          <label className="text-primary-text">Is Trial</label>
          <Switch
            checked={planData.isTrial}
            onChange={() => handleSwitchChange("isTrial")}
            className={`${
              planData.isTrial ? "bg-primary" : "bg-card"
            } rounded-full shadow-inner`}
          />
        </div>
        <div className="flex items-center space-x-4">
          <label className="text-primary-text">Is Visible</label>
          <Switch
            checked={planData.isVisible}
            onChange={() => handleSwitchChange("isVisible")}
            className={`${
              planData.isVisible ? "bg-primary" : "bg-card"
            } rounded-full shadow-inner`}
          />
        </div>
        <div className="flex items-center space-x-4">
          <label className="text-primary-text">Open For Admission</label>
          <Switch
            checked={planData.openForAdmission}
            onChange={() => handleSwitchChange("openForAdmission")}
            className={`${
              planData.openForAdmission ? "bg-primary" : "bg-card"
            } rounded-full shadow-inner`}
          />
        </div>

        {/* Submit button */}
        <Button
          type="submit"
          className="w-full bg-primary text-button-text hover:bg-primary-foreground py-3 rounded-lg shadow-lg transition-all hover:scale-105"
        >
          {id ? "Update Plan" : "Create Plan"}
        </Button>
      </form>
    </div>
  );
};

export default PlanForm;
