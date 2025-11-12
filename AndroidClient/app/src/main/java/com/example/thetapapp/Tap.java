package com.example.thetapapp;

/**
 Tap model class:
 Represents a single Tap record with its attributes.
 Matches the JSON structure returned from the backend API.
 */
public class Tap {
    private String id;
    private String container_type;
    private String material;
    private String size;
    private String flow_rate;
    private String category;

    // Getters for Tap properties
    public String getId() { return id; }
    public String getContainer_type() { return container_type; }
    public String getMaterial() { return material; }
    public String getSize() { return size; }
    public String getFlow_rate() { return flow_rate; }
    public String getCategory() { return category; }
}
