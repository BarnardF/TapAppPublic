package com.example.thetapapp;

import static androidx.core.content.ContextCompat.startActivity;

import android.content.Context;
import android.content.Intent;
import android.util.AttributeSet;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import com.squareup.picasso.Picasso;

public class TapItemButton extends LinearLayout {
    private TextView m_tapTitle;
    private TextView m_tapDescription;
    private ImageView m_ImageView;
    private String m_id;

    public TapItemButton(Context context) {
        super(context);
        init(context);
    }

    public TapItemButton(Context context, AttributeSet attrs) {
        super(context, attrs);
        init(context);
    }

    public TapItemButton(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init(context);
    }

    private void init(Context context) {
        LayoutInflater.from(context).inflate(R.layout.activity_tap_button, this, true);

        m_tapTitle = findViewById(R.id.tvTitle);
        m_tapDescription = findViewById(R.id.tvDescription);
        m_ImageView = findViewById(R.id.tvImage);

        this.setOnClickListener(v -> onLayoutClick(v));
    }

    public void ConstructButton(String title, String description, String imageURL, String ID) {
        m_tapTitle.setText(title);
        m_tapDescription.setText(description);
        m_id = ID;

        Picasso.get()
                .load(imageURL)
                .into(m_ImageView);
    }


    public void onLayoutClick(View view) {
        Context ctx = getContext();
        Intent intent = new Intent(ctx, TapView.class);
        intent.putExtra("filters", m_id);

        if (!(ctx instanceof android.app.Activity)) {
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        }

        try {
            ctx.startActivity(intent);
        } catch (Exception e) {
            e.printStackTrace(); // Log the stack trace for debugging
            // Optionally show a toast so the user knows something went wrong
            Toast.makeText(ctx, "Unable to open view.", Toast.LENGTH_SHORT).show();
        }


    }
}
